import * as React from 'react';
import { motion } from 'framer-motion';

import './Styles/TimerMessage.css';

import Variants from '../Controllers/Variants';

const TimerMessage = ({ seconds }) => {
    function formatSeconds(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }

    return (
        <motion.div
            className="TimerMessage"
            animate={seconds !== 0 ? 'active' : 'inActive'}
            variants={Variants.TimerMessage}
        >
            <motion.img
                className="loadingIcon"
                src={require('../Imgs/Loading_icon.gif')}
            />
            <p>{formatSeconds(seconds)} to finish</p>
        </motion.div>
    );
};

export default TimerMessage;
