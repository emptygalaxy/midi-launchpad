const launchpad = require('./');

launchpad.on('open', function()
{
    console.log('opened');
});

launchpad.on('update', function(state, index, col, row)
{
    console.log(state, index, col, row);
});

// ipad.setCanvas(36, 4, 4, true);
launchpad.setCanvas(0, 16, 8, false);
launchpad.open('iPad');