<img src="./src/assets/icons/vindr_lab_logo.png" width="256"/>

# VinDr Lab / Dashboard
Vindr Lab Dashboard is a part of the VinLab project. It allows users to manage Projects, Labels, Task, Export label, Upload DICOM files and many more features.

## Developing
The Vindr Lab project consists of two parts. So let's clone and run both projects together.
- [Vindr Lab Dashboard][vindr-lab-dashboard-url]: To manage Projects, Study list, Label, setting, Export label,...
- [Vindr Lab Viewer][vindr-lab-viewer-url]: For viewing medical images, labeling (bounding box, polygon, segment).

### Requirements

- [Yarn 1.17.3+](https://yarnpkg.com/en/docs/install)
- [Node 10+](https://nodejs.org/en/)
- Yarn Workspaces should be enabled on your machine:
  - `yarn config set workspaces-experimental true`

### Getting Started

1. [Fork this repository][how-to-fork]
2. [Clone your forked repository][how-to-clone]
   - `git clone https://github.com/YOUR-USERNAME/vindr-lab-dashboard.git`
3. Navigate to the cloned project's directory
4. Add this repo as a `remote` named `upstream`
   - `git remote add upstream https://github.com/vinbigdata-medical/vindr-lab-dashboard.git`
5. `yarn install` to restore dependencies and link projects

## Commands

These commands are available from the root directory.

| Yarn Commands                | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| **Develop**                  |                                                               |
| `start`                      | Default development experience for Dashboard                  |
| **Deploy**                   |                                                               |
| `build` or `build:prod`      | Builds production environment                                 |
| `build:stg`                  | Builds staging environment                                    |
| `build:dev`                  | Builds Builds develop environment                             |


## Projects Architecture

```bash
.
├── public                  #
├── src                     #
│   ├── assets              # images and icons
│   ├── components          # Reusable React components
│   ├── utils               # locale, helpers, constants and service files
│   └── view                #
│
├── ...                     # misc. shared configuration
├── package.json            # Shared devDependencies and commands
└── README.md               # This file
```

## Acknowledgement

**Note:** If you use or find this repository helpful, please take the time to star this repository on Github. This is an easy way for us to assess adoption and it can help us obtain future funding for the project.

This work is supported primarily by [Vingroup Big Data Institute](http://vinbigdata.org/)
## License

[MIT License](https://github.com/vinbigdata-medical/vinlab-sites/blob/master/LICENSE)

<!-- prettier-ignore-start -->
<!-- Links -->
[vindr-lab-dashboard-url]: https://github.com/vinbigdata-medical/vindr-lab-dashboard
[vindr-lab-viewer-url]: https://github.com/vinbigdata-medical/vindr-lab-viewer
<!-- prettier-ignore-end -->
