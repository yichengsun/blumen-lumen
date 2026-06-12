import * as React from 'react';
import './Styles/Toggle.css';
import { motion } from 'framer-motion';

import ToggleButton from './ToggleButton';

import Variants from '../Controllers/Variants';

const Toggle = ({ state, toggle1, toggle2, handleToggle, seconds }) => {
    let value1 = toggle1.toLowerCase();
    let value2 = toggle2.toLowerCase();

    return (
        <motion.div
            className="Toggle"
            whileTap={{ scale: 0.8 }}
            animate={seconds === 0 ? 'active' : 'inActive'}
            variants={Variants.Toggle}
        >
            <ToggleButton
                title={toggle1}
                value={value1}
                handleToggle={handleToggle}
                isActive={state === value1 ? true : false}
            />
            <ToggleButton
                title={toggle2}
                value={value2}
                handleToggle={handleToggle}
                isActive={state === value2 ? true : false}
            />
            <motion.div
                className="ToggleSwitchBox"
                animate={state === value1 ? 'leftMode' : 'rightMode'}
                variants={Variants.ToggleSwitchBox}
            ></motion.div>
        </motion.div>
    );
};

export default Toggle;
