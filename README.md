# Echo DB

Convenient interface to Echo blockchain data

## Installation
### Prepare project
1. Clone the project
2. Move to the cloned directory
3. Install dependencies: `npm install`
### Install TypeScript
* Ubuntu 18.04
   * `sudo apt-get install node-typescript`



## Scripts
Full list of scripts is listed in the `package.json`  
**Note!** Every start `./src/*` files are compiling in nodeJs to `./dist` folder.

---
* `npm run build`  
Compiles project to nodeJs to `./dist` folder
---
* `npm start`  
Same to `npm run start:api`
---
* `npm run start:api`  
Run the `api` module in local environment
---
* `npm run dev:api`  
Run the `api` module in local environment with hot-reloading
---
