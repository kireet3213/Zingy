module.exports = {
    apps: [
        {
            name: 'zingy',
            script: 'dist/app.js',
            watch: '.',
            env_production: {
                NODE_ENV: 'production',
            },
            exec_mode: 'cluster',
            error_file: './',
        },
    ],
};
