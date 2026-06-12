import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/Button.css';

import Variants from '../Controllers/Variants';

const Button = ({ buttonIndex, title, isActive, handleClick }) => {
    return (
        <motion.div
            className="Button"
            whileTap={{ scale: 0.8 }}
            animate={isActive === true ? 'active' : 'inActive'}
            variants={Variants.Button}
            onClick={e => handleClick(e, buttonIndex)}
        >
            <p>{title}</p>
        </motion.div>
    );
};

export default Button;
