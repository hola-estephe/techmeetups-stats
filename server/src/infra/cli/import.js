'use strict';

import importEvents from '../../app/import';

(async () => {
    await importEvents();
})().catch(e => console.error(e.stack));
