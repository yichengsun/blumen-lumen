import React from 'react';

import { navBarSelectionStates } from './Controllers/States';

import TopNav from './Components/TopNav';
import Controller from './Components/Controller';

import './App.css';

function App() {
    const [navBarSelection, setNavBarSelection] = React.useState(
        navBarSelectionStates.BLUMEN_LUMEN
    );

    function handleNavBarSelectionSwitch(e, state) {
        e.preventDefault();
        setNavBarSelection(state);
    }
    return (
        <div className="App">
            <TopNav
                navBarSelection={navBarSelection}
                handleNavBarSelectionSwitch={handleNavBarSelectionSwitch}
            />
            <Controller navBarSelection={navBarSelection} />
        </div>
    );
}

export default App;
