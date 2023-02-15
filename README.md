# Export DWGs from Revit files with Design Automation

[![Node.js](https://img.shields.io/badge/Node.js-16.15.1-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-4.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](http://developer.autodesk.com/)
[![Design-Automation](https://img.shields.io/badge/Design%20Automation-v3-green.svg)](http://developer.autodesk.com/)


![Windows](https://img.shields.io/badge/Plugins-Windows-lightgrey.svg)
![.NET](https://img.shields.io/badge/.NET%20Framework-4.8-blue.svg)
[![Revit-2021](https://img.shields.io/badge/Revit-2021-lightgrey.svg)](http://autodesk.com/revit)


![Advanced](https://img.shields.io/badge/Level-Advanced-red.svg)
[![MIT](https://img.shields.io/badge/License-MIT-blue.svg)](http://opensource.org/licenses/MIT)

# Description

This sample demonstrated how to export Revit views to DWGs using Design Automation for Revit API.

# Thumbnail
![thumbnail](/thumbnail.png)

![thumbnail](/thumbnail2.png)

# Demonstration

Here is the video demonstrating how this sample works quickly.

[![](http://img.youtube.com/vi/VGxAMOBiqB0/0.jpg)](http://www.youtube.com/watch?v=VGxAMOBiqB0 "Demo how to export 2D&3D DWGs from the selected Revit model views.")

<!---# Live Demo
[https://fileupgradersample.herokuapp.com/](https://fileupgradersample.herokuapp.com/)--->

# Main Parts of The Work
1. Create a Revit Plugin to be used within AppBundle of Design Automation for Revit. Please check [PlugIn](./DWGExporter/PlugIn/) 
2. Create your App, upload the AppBundle, define your Activity and test the workitem with the Postman collection under [Postman Collection](./DWGExporter/PostmanCollection/), or you can refer ([https://youtu.be/1NCeH7acIko](https://youtu.be/1NCeH7acIko)) and simply use the `Configure` button in the Web Application to create the Appbundle & Activity.
3. Create the Web App to call the workitem.

# Web App Setup

## Prerequisites

1. **Forge Account**: Learn how to create a Forge Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). 
2. **Visual Code**: Visual Code (Windows or MacOS).
3. **ngrok**: Routing tool, [download here](https://ngrok.com/)
4. **Revit 2021**: required to compile changes into the plugin
5. **JavaScript** syntax for server-side.
6. **JavaScript** basic knowledge with **jQuery**


For using this sample, you need an Autodesk developer credentials. Visit the [Forge Developer Portal](https://developer.autodesk.com), sign up for an account, then [create an app](https://developer.autodesk.com/myapps/create). For this new app, use **http://localhost:3000/api/forge/callback/oauth** as Callback URL. Finally take note of the **Client ID** and **Client Secret**.

## Running locally

Install [NodeJS](https://nodejs.org), version 8 or newer.

Clone this project or download it (this `nodejs` branch only). It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/yiskang/forge-revit-dwg-export-bim360

Install the required packages using `npm install`.

### ngrok

Install [ngrok](https://ngrok.com)

Run `ngrok http 3000` to create a tunnel to your local machine, and join the address with `/api/forge/callback/designautomation` (e.g. `http://8cc1f77a.ngrok.io/api/forge/callback/designautomation`), then copy it into the `FORGE_WEBHOOK_URL` environment variable. Please check [WebHooks](https://forge.autodesk.com/en/docs/webhooks/v1/tutorials/configuring-your-server/) for details.

### Environment variables

Set the enviroment variables with your client ID & secret and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following. For example:

Mac OSX/Linux (Terminal)

    npm install
    export FORGE_CLIENT_ID=obQDn8P0GanGFQha4ngKKVWcxwyvFAGE
    export FORGE_CLIENT_SECRET=abcdefgh12345678
    export FORGE_CALLBACK_URL=http://localhost:3000/api/forge/callback/oauth
    export FORGE_WEBHOOK_URL=http://875bd739.ngrok.io/api/forge/callback/designautomation
    export DESIGN_AUTOMATION_NICKNAME=MyDaNickname
    export DESIGN_AUTOMATION_ACTIVITY_NAME=ExportDwgActivity+dev
    npm start

Windows (use **Node.js command line** from Start menu)

    npm install
    set FORGE_CLIENT_ID=obQDn8P0GanGFQha4ngKKVWcxwyvFAGE
    set FORGE_CLIENT_SECRET=abcdefgh12345678
    set FORGE_CALLBACK_URL=http://localhost:3000/api/forge/callback/oauth
    set FORGE_WEBHOOK_URL=http://875bd739.ngrok.io/api/forge/callback/designautomation
    set DESIGN_AUTOMATION_NICKNAME=MyDaNickname
    set DESIGN_AUTOMATION_ACTIVITY_NAME=ExportDwgActivity+dev
    npm start

Windows (use **PowerShell** or **PowerShell Core**)

    npm install
    $env:FORGE_CLIENT_ID='obQDn8P0GanGFQha4ngKKVWcxwyvFAGE'
    $env:FORGE_CLIENT_SECRET='abcdefgh12345678'
    $env:FORGE_CALLBACK_URL='http://localhost:3000/api/forge/callback/oauth'
    $env:FORGE_WEBHOOK_URL='http://875bd739.ngrok.io/api/forge/callback/designautomation'
    $env:DESIGN_AUTOMATION_NICKNAME='MyDaNickname'
    $env:DESIGN_AUTOMATION_ACTIVITY_NAME='ExportDwgActivity+dev'
    npm start

### Using the app

Open the browser: [http://localhost:3000](http://localhost:3000), there are 2 ways to upgrade files: 

1. Select Revit file version in BIM360 Hub to view the Model, Select parameters which you want to `export all`|`selective export`, Click 'Execute'.
2. After DA4R processing, it will show up a **Download** link on the top of the progress bar.

`Note`: When you deploy the app, you have to open the `Configure` button to create the AppBundle & Activity before running the Export|Import feature, please check the video for the steps at [https://youtu.be/1NCeH7acIko](https://youtu.be/1NCeH7acIko)

## Deployment

To deploy this application to Heroku, the **Callback URL** for Forge must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret, Callback URL and Revit Design Automation variables for Forge.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yiskang/forge-revit-dwg-export-bim360)

Watch [this video](https://www.youtube.com/watch?v=Oqa9O20Gj0c) as reference on how to deploy samples to Heroku.



## Packages used

The [Autodesk Forge](https://www.npmjs.com/package/forge-apis) packages is included by default. Some other non-Autodesk packaged are used, including [socket.io](https://www.npmjs.com/package/socket.io), [express](https://www.npmjs.com/package/express).

## Further Reading

Documentation:
- This sample is based on [Learn Forge Tutorial](https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/tree/nodejs), please check details there about the basic framework if you are not familar. 

- [Design Automation API](https://forge.autodesk.com/en/docs/design-automation/v3/developers_guide/overview/)
- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [Data Management API](httqqqps://developer.autodesk.com/en/docs/data/v2/overview/)

Desktop APIs:

- [Revit](https://knowledge.autodesk.com/support/revit-products/learn-explore/caas/simplecontent/content/my-first-revit-plug-overview.html)

## Tips & Tricks
- Before using the sample to call the workitem, you need to setup your Appbundle & Activity of Design Automation, you can follow my Postman script to understand the whole process, or you can simply use the `Configure` button in the Web Application to create the Appbundle & Activity([https://youtu.be/1NCeH7acIko](https://youtu.be/1NCeH7acIko)). 

## Troubleshooting

After installing Github desktop for Windows, on the Git Shell, if you see a ***error setting certificate verify locations*** error, use the following:

    git config --global http.sslverify "false"

## Limitation
- Be aware of the version of [socket.io](https://www.npmjs.com/package/socket.io) used in the [index.html](./public/index.html). It should be the same version installed with the npm.
- Before using the sample to call the workitem, you need to setup your Appbundle & Activity of Design Automation, you can follow my Postman script to understand the whole process, or you can simply use the `Configure` button in the Web Application to create the Appbundle & Activity([https://youtu.be/1NCeH7acIko](https://youtu.be/1NCeH7acIko)). 
- Currently Revit Cloud Worksharing is not supported by the Design Automation.  The scenario that this sample demonstrates is applicable only with a file-based Revit model license.
- Client JavaScript requires modern browser.
- Currently, the sample supports Design Automation engine 2021, you can use `Configure` button to delete|create different versions of Design Automation Revit engine.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

Eason Kang <br />
Forge Partner Development <br />
https://developer.autodesk.com/ <br />
https://forge.autodesk.com/blog <br />
