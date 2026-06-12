import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/TopNavButton.css';

import Variants from '../Controllers/Variants';

const NavButton = ({
    buttonIndex,
    title,
    handleNavBarSelectionSwitch,
    isActive
}) => {
    return (
        <motion.div>
            <motion.div
                className="NavButton"
                // whileTap={{ scale: 0.95 }}
                onClick={e => handleNavBarSelectionSwitch(e, buttonIndex)}
                variants={Variants.NavButton}
                animate={isActive ? 'active' : 'inActive'}
            >
                <motion.img
                    src={require(`../Imgs/NavButton${buttonIndex}.png`)}
                />

                <motion.h2 variants={Variants.NavButtonTitle}>
                    {title}
                </motion.h2>
            </motion.div>
        </motion.div>
    );
};

export default NavButton;
