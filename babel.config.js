module.exports = {
    "presets": [[
        "@babel/preset-env",
        {
            "targets": {
                "esmodules": true,
                "node": "current"
            }
        }
    ]],
    "plugins": ["transform-class-properties", "@babel/plugin-transform-runtime", '@babel/plugin-transform-regenerator']
};
