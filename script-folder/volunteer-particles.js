const particlesConfig = {
    particles: {
        number: {
            value: 120,  
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: "#0078d4"
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.3, 
            random: false,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 4,  
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#0078d4",
            opacity: 0.3,  
            width: 1.5  
        },
        move: {
            enable: true,
            speed: 2,  
            direction: "none",
            random: true,
            straight: false,
            out_mode: "bounce",  
            bounce: true,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "grab"
            },
            onclick: {
                enable: true,
                mode: "push"  
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 200,
                line_linked: {
                    opacity: 0.4
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
};

document.addEventListener('DOMContentLoaded', () => {
    particlesJS('particles-bg', particlesConfig);
});
