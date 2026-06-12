const transitionNormal = {
    duration: 0.4,
    ease: 'easeInOut'
};

const Variants = {
    Content: {
        initial: {
            opacity: 0,
            transition: transitionNormal
        },
        animate: {
            opacity: 0.2,
            transition: {
                duration: 0.2,
                when: 'beforeChildren',
                staggerChildren: 2
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                when: 'afterChildren',
                staggerChildren: 2,
                staggerDirection: -1
            }
        }
    },

    BlumenLumenContent: {
        initial: {
            x: -100,
            opacity: 0,
            transition: transitionNormal
        },
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 2
            }
        },
        exit: {
            x: -100,
            opacity: 0,
            transition: {
                duration: 0.2,
                when: 'afterChildren',
                staggerChildren: 2,
                staggerDirection: -1
            }
        }
    },
    RoomLightContent: {
        initial: {
            x: 100,
            opacity: 0,
            transition: transitionNormal
        },
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 2
            }
        },
        exit: {
            x: 100,
            opacity: 0,
            transition: {
                duration: 0.2,
                when: 'afterChildren',
                staggerChildren: 2,
                staggerDirection: -1
            }
        }
    },
    BlumenLumenCustomSection: {
        initial: {
            y: -50,
            opacity: 0,
            transition: transitionNormal
        },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 2
            }
        },
        exit: {
            y: -50,
            opacity: 0,
            transition: {
                duration: 0.2,
                when: 'afterChildren',
                staggerChildren: 2,
                staggerDirection: -1
            }
        }
    },
    BlumenLumenDefaultSection: {
        initial: {
            opacity: 0,
            transition: transitionNormal
        },
        animate: {
            opacity: 0.5,
            transition: {
                when: 'beforeChildren',
                staggerChildren: 2
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                when: 'afterChildren',
                staggerChildren: 2,
                staggerDirection: -1
            }
        }
    },
    ToggleSwitchBox: {
        leftMode: {
            x: 0.0,
            transition: {
                duration: 0.2
            }
        },
        rightMode: {
            x: 120.0,
            transition: {
                duration: 0.2
            }
        }
    },
    NavButton: {
        active: {
            opacity: 1.0,
            color: 'rgba(0, 0, 0, 0.95)',

            transition: {
                duration: 0.2
            }
        },
        inActive: {
            opacity: 0.2,
            transition: {
                duration: 0.2
            }
        }
    },

    NavButtonTitle: {
        active: {
            height: 14,
            y: 0,
            borderBottom: '14px solid #FFC700',
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            height: 14,
            y: -10,
            borderBottom: '0px solid #FFC700',
            transition: {
                duration: 0.2
            }
        }
    },
    NavButtonUnderScore: {
        active: {
            height: 14,
            y: 45,
            backgroundColor: '#FFC700',

            transition: {
                duration: 0.2
            }
        },
        inActive: {
            height: 0,
            y: -20,
            backgroundColor: '#FFC700',
            transition: {
                duration: 0.2
            }
        }
    },
    Button: {
        active: {
            backgroundColor: 'rgba(255, 200, 0, 1)',
            color: 'rgba(0, 0, 0, 0.95)',
            border: '1px solid #FFC700',
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            backgroundColor: 'rgba(255, 200, 0, 0.0)',
            color: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid #BFBFBF',
            transition: {
                duration: 0.2
            }
        }
    },
    ColorPalette: {
        active: {
            scale: 1.0,
            opacity: 1,
            border: '1px solid #212121',
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            scale: 0.8,
            opacity: 0.3,
            border: '1px solid #BFBFBF',
            transition: {
                duration: 0.2
            }
        }
    },
    Toggle: {
        active: {
            opacity: 1.0,
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            opacity: 0.2,
            transition: {
                duration: 0.2
            }
        }
    },
    OpenSlider: {
        active: {
            opacity: 1.0,
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            opacity: 0.2,
            transition: {
                duration: 0.2
            }
        }
    },
    ToogleButton: {
        active: {
            opacity: 0.95,
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            opacity: 0.4,
            transition: {
                duration: 0.2
            }
        }
    },
    TimerMessage: {
        active: {
            x: 0,
            opacity: 0.8,
            transition: {
                duration: 0.2
            }
        },
        inActive: {
            x: -20,
            opacity: 0.0,
            transition: {
                duration: 0.2
            }
        }
    },
    TopSwitcher: {
        custom: {
            scale: 1,
            y: 0,
            transition: {
                duration: 0.2
            }
        },
        default: {
            scale: 1.1,
            y: 50,
            transition: {
                duration: 0.2
            }
        }
    }
};

export default Variants;
