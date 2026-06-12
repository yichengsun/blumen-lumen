import * as React from 'react';
import { motion } from 'framer-motion';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

import './Styles/OpenSlider.css';

import Variants from '../Controllers/Variants';

const PrettoSlider = withStyles({
    root: {
        color: '#FFE999',
        height: 8,
        marginRight: 3,
        width: 320
    },
    thumb: {
        height: 30,
        width: 30,
        backgroundColor: '#FFC700',
        marginTop: -12,
        marginLeft: -10,

        '&:focus,&:hover,&$active': {
            boxShadow: 'inherit'
        }
    },
    mark: {
        backgroundColor: '#C4C4C4',
        height: 8,
        width: 8,
        borderRadius: 4
        // marginLeft: -5
    },
    markActive: {
        opacity: 1,
        backgroundColor: '#FFC700'
    },
    valueLabel: {
        marginLeft: 18,
        top: -40,
        '& *': {
            background: '#FFC700',
            color: '#000',
            fontFamily: 'Gotham'
        }
    },

    active: {},

    track: {
        height: 4,
        marginTop: 2,
        borderRadius: 4
    },
    rail: {
        height: 4,
        marginTop: 2,
        borderRadius: 4,
        width: 328,
        color: '#C4C4C4'
    }
})(Slider);

const OpenSlider = ({
    value,
    seconds,
    handleChange,
    handleChangeCommitted
}) => {
    return (
        <motion.div
            className="OpenSliderContent"
            animate={seconds === 0 ? 'active' : 'inActive'}
            variants={Variants.OpenSlider}
        >
            <motion.div className="OpenScroll">
                <PrettoSlider
                    marks
                    value={value}
                    max={100}
                    min={0}
                    step={25}
                    valueLabelDisplay="off"
                    onChange={(e, value) => handleChange(e, value)}
                    onChangeCommitted={(e, value) =>
                        handleChangeCommitted(e, value)
                    }
                />
                <p className="LabelOpen">Open</p>
                <p className="LabelClosed">Closed</p>
            </motion.div>
        </motion.div>
    );
};

export default OpenSlider;
