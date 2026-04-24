const { Engine, World, Bodies, Body, Events, Runner, Mouse, MouseConstraint } =
  Matter;

class FloatingItemsPhysics {
  constructor(selector = ".item") {
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.runner = Runner.create();

    this.items = [...document.querySelectorAll(selector)];
    this.bodies = [];

    this.breakpoints = {
      tablet: 768,
      desktop: 1025,
    };

    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.world.gravity.x = 0;
    this.world.gravity.y = 1.2;

    this.boundaries = {
      ground: Bodies.rectangle(0, 0, 10, 10, { isStatic: true }),
      left: Bodies.rectangle(0, 0, 10, 10, { isStatic: true }),
      right: Bodies.rectangle(0, 0, 10, 10, { isStatic: true }),
    };

    World.add(this.world, [
      this.boundaries.ground,
      this.boundaries.left,
      this.boundaries.right,
    ]);
  }

  init() {
    if (!this.items.length) return;

    this.updateBoundaries();
    this.createBodies();
    this.bindRenderLoop();
    this.enableDesktopDrag();
    this.enableTilt();
    this.bindEvents();

    Runner.run(this.runner, this.engine);

    if (!this.isDesktop()) {
      this.nudgeBodies(0.01);
    }
  }

  bindEvents() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("touchstart", this.handleTouchStart, {
      passive: true,
    });
  }

  handleResize = () => {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;

    this.updateBoundaries();
    this.resizeBodies();
  };

  handleTouchStart = () => {
    if (!this.isDesktop()) {
      this.nudgeBodies();
    }
  };

  bindRenderLoop() {
    Events.on(this.engine, "afterUpdate", () => {
      this.bodies.forEach((body) => {
        if (!body.el) return;

        this.syncDomSize(body);
        body.el.style.left = `${body.position.x}px`;
        body.el.style.top = `${body.position.y}px`;
        body.el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
    });
  }

  isDesktop() {
    return this.viewport.width >= this.breakpoints.desktop;
  }

  isTablet() {
    return (
      this.viewport.width >= this.breakpoints.tablet &&
      this.viewport.width < this.breakpoints.desktop
    );
  }

  isAboutPage() {
    return document.body.id === "aboutPage";
  }

  getItemSize() {
    const { width } = this.viewport;

    if (this.isAboutPage()) {
      if (this.isDesktop()) return Math.min(270, Math.max(140, width * 0.2));
      if (this.isTablet()) return Math.min(210, Math.max(115, width * 0.18));
      return Math.min(220, Math.max(125, width * 0.18));
    }

    if (this.isDesktop()) return Math.min(239, Math.max(121, width * 0.16));
    if (this.isTablet()) return Math.min(180, Math.max(100, width * 0.16));
    return Math.min(170, Math.max(95, width * 0.16));
  }

  getSpawnTop() {
    return -Math.max(160, this.viewport.height * 0.2);
  }

  getWallConfig() {
    const { width } = this.viewport;

    if (this.isDesktop()) {
      return {
        thickness: Math.max(120, width * 0.16),
        inset: Math.max(42, width * 0.05),
        angle: 0.24,
      };
    }

    if (this.isTablet()) {
      return {
        thickness: Math.max(110, width * 0.14),
        inset: Math.max(30, width * 0.04),
        angle: 0.16,
      };
    }

    return {
      thickness: Math.max(90, width * 0.12),
      inset: Math.max(20, width * 0.03),
      angle: 0.08,
    };
  }

  getBodyOptions() {
    if (this.isDesktop()) {
      return {
        restitution: 0.72,
        friction: 0.08,
        frictionAir: 0.004,
        density: 0.0012,
      };
    }

    return {
      restitution: 0.78,
      friction: 0.04,
      frictionAir: 0.016,
      density: 0.001,
    };
  }

  setBodyShape(body, x, y, bodyWidth, bodyHeight, angle = 0) {
    Body.setPosition(body, { x, y });
    Body.setVertices(
      body,
      Bodies.rectangle(x, y, bodyWidth, bodyHeight, { isStatic: true })
        .vertices,
    );
    Body.setAngle(body, angle);
  }

  updateBoundaries() {
    const { width, height } = this.viewport;
    const { thickness, inset, angle } = this.getWallConfig();

    this.setBodyShape(
      this.boundaries.ground,
      width / 2,
      height + thickness * 0.45,
      width * 2,
      thickness,
      0,
    );

    this.setBodyShape(
      this.boundaries.left,
      -inset,
      height / 2,
      thickness,
      height * 2,
      angle,
    );

    this.setBodyShape(
      this.boundaries.right,
      width + inset,
      height / 2,
      thickness,
      height * 2,
      -angle,
    );
  }

  getSpawnLayout(size) {
    const { width } = this.viewport;

    if (this.isDesktop()) {
      return this.items.map((_, index) => ({
        x: ((index + 1) * width) / (this.items.length + 1),
        y: this.getSpawnTop() - index * 12,
      }));
    }

    const usableWidth = width - size;
    const columns = Math.max(
      2,
      Math.min(4, Math.floor(usableWidth / (size * 1.1))),
    );
    const gapX = usableWidth / columns;
    const gapY = size * 1.3;

    return this.items.map((_, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const centerX = size * 0.5 + gapX * col + gapX * 0.5;
      const jitterX = (Math.random() - 0.5) * Math.min(18, size * 0.16);

      return {
        x: Math.max(
          size * 0.55,
          Math.min(width - size * 0.55, centerX + jitterX),
        ),
        y: this.getSpawnTop() - row * gapY - Math.random() * 20,
      };
    });
  }

  createBodies() {
    const size = this.getItemSize();
    const options = this.getBodyOptions();
    const layout = this.getSpawnLayout(size);

    this.items.forEach((el, index) => {
      const body = Bodies.rectangle(
        layout[index].x,
        layout[index].y,
        size,
        size,
        options,
      );

      body.el = el;
      body.baseSize = size;

      Body.setAngle(body, Math.random() * Math.PI * 2);
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

      this.bodies.push(body);
    });

    World.add(this.world, this.bodies);
  }

  resizeBodies() {
    const nextSize = this.getItemSize();
    const { width } = this.viewport;

    this.bodies.forEach((body) => {
      const scale = nextSize / body.baseSize;

      if (Math.abs(scale - 1) > 0.01) {
        Body.scale(body, scale, scale);
        body.baseSize = nextSize;
      }

      if (body.position.x < -nextSize) {
        Body.setPosition(body, { x: nextSize, y: body.position.y });
      }

      if (body.position.x > width + nextSize) {
        Body.setPosition(body, { x: width - nextSize, y: body.position.y });
      }

      this.syncDomSize(body);
    });
  }

  syncDomSize(body) {
    body.el.style.width = `${body.baseSize}px`;
    body.el.style.height = `${body.baseSize}px`;
  }

  nudgeBodies(force = 0.012) {
    this.bodies.forEach((body) => {
      Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * force,
        y: -Math.random() * force,
      });
    });
  }

  enableTilt() {
    if (!window.DeviceOrientationEvent || this.isDesktop()) return;

    const onTilt = () => {
      if (this.isDesktop()) {
        this.world.gravity.y = 1.12;
      } else if (this.isTablet()) {
        this.world.gravity.y = 1;
      } else {
        this.world.gravity.y = 0.7;
      }
    };

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      window.addEventListener(
        "touchstart",
        async function requestTilt() {
          window.removeEventListener("touchstart", requestTilt);

          try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
              window.addEventListener("deviceorientation", onTilt, {
                passive: true,
              });
            }
          } catch {
            return;
          }
        },
        { passive: true },
      );

      return;
    }

    window.addEventListener("deviceorientation", onTilt, { passive: true });
  }

  enableDesktopDrag() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const mouse = Mouse.create(document.body);
  const mouseConstraint = MouseConstraint.create(this.engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });

  World.add(this.world, mouseConstraint);
}
}

function startPhysicsAfterLoader() {
  const physics = new FloatingItemsPhysics(".item");
  const loader = document.getElementById("pageLoader");
  let hasStarted = false;

  const start = (delay = 180) => {
    if (hasStarted) return;
    hasStarted = true;

    window.setTimeout(() => {
      physics.init();
    }, delay);
  };

  if (!loader) {
    start(0);
    return;
  }

  if (loader.classList.contains("is-hidden")) {
    start();
    return;
  }

  const observer = new MutationObserver(() => {
    if (loader.classList.contains("is-hidden")) {
      observer.disconnect();
      start();
    }
  });

  observer.observe(loader, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.setTimeout(() => {
    observer.disconnect();
    start(200);
  }, 1200);
}

window.addEventListener("load", startPhysicsAfterLoader);
