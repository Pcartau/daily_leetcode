module.exports = {
  apps : [{
    name   : "Daily leetcode",
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