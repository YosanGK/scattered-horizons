const commonConfig = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    },
    shape: {
      type: "circle"
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: {
        enable: false
      }
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: false
      }
    },
    line_linked: {
      enable: true,
      distance: 150,
      opacity: 0.3,
      width: 1
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false
      }
    }
  }
};

export const infrastructureConfig = {
  ...commonConfig,
  particles: {
    ...commonConfig.particles,
    color: {
      value: "#0078d4"
    },
    line_linked: {
      ...commonConfig.particles.line_linked,
      color: "#0078d4"
    }
  }
};

export const educationConfig = {
  ...commonConfig,
  particles: {
    ...commonConfig.particles,
    color: {
      value: "#3498db"
    },
    line_linked: {
      ...commonConfig.particles.line_linked,
      color: "#3498db"
    }
  }
};
