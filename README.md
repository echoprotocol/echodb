# Echo DB

Convenient interface to Echo blockchain data

## Installation
### Prepare project
1. Clone the project
2. Move to the cloned directory
3. Install dependencies: `npm install`
## Install GitLab dependencies
This project uses some GitLab dependencies needed to be install manually.  
Steps to install such dependency:
1) Clone dependency in a separate folder.
2) Build. (`npm run build` is a common command)
3) Run `npm link`
4) Go to this project (not dependency!) folder
5) Run `npm link {dependency_name}`



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

## License

The MIT License (MIT)

Copyright (c) Echo Technological Solutions LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
