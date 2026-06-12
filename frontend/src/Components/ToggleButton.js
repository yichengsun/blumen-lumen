import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/ToggleButton.css';

import Variants from '../Controllers/Variants';
const ToggleButton = ({ title, value, isActive, handleToggle }) => {
    return (
        <motion.div
            className="ToggleButton"
            onClick={e => handleToggle(e, value)}
            animate={isActive ? 'active' : 'inActive'}
            variants={Variants.ToogleButton}
        >
            <p>{title}</p>
        </motion.div>
    );
};

export default ToggleButton;
