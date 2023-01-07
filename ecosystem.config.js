module.exports = {
  apps : [{
    name   : "Ycombinator",
    script : "ts-node",
    args: './index.ts',
    env_production: {
       NODE_ENV: "production"
    },
    env_development: {
       NODE_ENV: "development"
    }
  }]
}