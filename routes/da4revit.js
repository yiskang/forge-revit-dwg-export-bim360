/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Autodesk Developer Advocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

const express = require('express');
const { credentials } = require('../config');

const {
    ItemsApi,
    VersionsApi,
    BucketsApi,
    ObjectsApi,
    PostBucketsSigned
} = require('forge-apis');

const { OAuth } = require('./common/oauthImp');

const {
    getWorkitemStatus,
    cancelWorkitem,
    exportDWG,
    workitemList
} = require('./common/da4revitImp')

const SOCKET_TOPIC_WORKITEM = 'Workitem-Notification';
const Temp_Output_File_Name = 'exportedDwgs.zip';

let router = express.Router();


///////////////////////////////////////////////////////////////////////
/// Middleware for obtaining a token for each request.
///////////////////////////////////////////////////////////////////////
router.use(async (req, res, next) => {
    const oauth = new OAuth(req.session);
    let credentials = await oauth.getInternalToken();
    let oauth_client = oauth.getClient();

    req.oauth_client = oauth_client;
    req.oauth_token = credentials;
    next();
});



///////////////////////////////////////////////////////////////////////
/// Export DWGs from Revit
///////////////////////////////////////////////////////////////////////
router.post('/da4revit/v1/revit/:version_storage/dwg', async (req, res, next) => {
    const inputJson = req.body;
    const inputRvtUrl = (req.params.version_storage);

    if (inputJson === '' || inputRvtUrl === '') {
        res.status(400).end('make sure the input version id has correct value');
        return;
    }

    // // generate S3 download url for the storage
    // const params = inputRvtUrl.split('?')[0].split('/');
    // let bucketKey = null;
    // let objectKey = null;
    // for (let i = 0; i < params.length; i++) {
    //     if (params[i] == 'buckets')
    //         bucketKey = params[++i];
    //     if (params[i] == 'objects')
    //         objectKey = params[++i];
    // }

    // if (bucketKey == null || objectKey == null) {
    //     res.status(400).end('failed to get input bueckt key and object key.');
    //     return;
    // }
    // const objectApi = new ObjectsApi();
    // const s3UrlOpts = {
    //     responseContentDisposition: `attachment; filename=${objectKey}`
    // };
    // const s3Url = await objectApi.getS3DownloadURL(bucketKey, objectKey, s3UrlOpts, req.oauth_client, req.oauth_token)
    // if (!s3Url || !s3Url.body || !s3Url.body.url) {
    //     res.status(400).end('failed to get s3 url for the storage.');
    //     return;
    // }

    ////////////////////////////////////////////////////////////////////////////////
    // use 2 legged token for design automation
    const oauth = new OAuth(req.session);
    const oauth_client = oauth.get2LeggedClient();;
    const oauth_token = await oauth_client.authenticate();

    // create the temp output storage
    // const bucketKey = credentials.client_id.toLowerCase() + '_designautomation';
    const bucketKey = credentials.client_id.toLowerCase() + '_designautomation';
    const opt = {
        bucketKey,
        policyKey: 'transient',
    }
    try {
        await new BucketsApi().createBucket(opt, {}, oauth_client, oauth_token);
    } catch (err) { // catch the exception while bucket is already there
    };

    try {
        const objectApi = new ObjectsApi();
        let objects = [];
        objects.push({ objectKey: 'exportedDwgs.zip', data: ' ' })
        // Create a storage and get the objectId, or you can create the objectId directly by the format "urn:adsk.objects:os.object:<BucketKey>/<ObjectKey>"
        const resources = await objectApi.uploadResources(bucketKey, objects, {}, oauth_client, oauth_token)
        const objectId = resources[0].completed.objectId;
        const objectKey = resources[0].completed.objectKey;
        const objectInfo = {
            BucketKey: bucketKey,
            ObjectKey: objectKey
        };

        let result = await exportDWG(inputRvtUrl, inputJson, objectId, objectInfo, oauth_token, req.oauth_token);
        if (result === null || result.statusCode !== 200) {
            console.log('failed to export DWGs from the RVT file');
            res.status(500).end('failed to export DWGs from the RVT file');
            return;
        }
        console.log('Submitted the workitem: ' + result.body.id);
        const exportInfo = {
            "workItemId": result.body.id,
            "workItemStatus": result.body.status,
            "ExtraInfo": null
        };
        res.status(200).end(JSON.stringify(exportInfo));
    } catch (err) {
        console.log('get exception while exporting to DWGs')
        let workitemStatus = {
            'Status': "Failed"
        };
        global.MyApp.SocketIo.emit(SOCKET_TOPIC_WORKITEM, workitemStatus);
        res.status(500).end(JSON.stringify(err));
    }
});


///////////////////////////////////////////////////////////////////////
/// Cancel the file workitem process if possible.
/// NOTE: This may not successful if the workitem process is already started
///////////////////////////////////////////////////////////////////////
router.delete('/da4revit/v1/revit/:workitem_id', async (req, res, next) => {

    const workitemId = req.params.workitem_id;
    try {
        const oauth = new OAuth(req.session);
        const oauth_client = oauth.get2LeggedClient();;
        const oauth_token = await oauth_client.authenticate();
        await cancelWorkitem(workitemId, oauth_token.access_token);
        let workitemStatus = {
            'WorkitemId': workitemId,
            'Status': "Cancelled"
        };

        const workitem = workitemList.find((item) => {
            return item.workitemId === workitemId;
        })
        if (workitem === undefined) {
            console.log('the workitem is not in the list')
            return;
        }
        console.log('The workitem: ' + workitemId + ' is cancelled')
        let index = workitemList.indexOf(workitem);
        workitemList.splice(index, 1);

        global.MyApp.SocketIo.emit(SOCKET_TOPIC_WORKITEM, workitemStatus);
        res.status(204).end();
    } catch (err) {
        res.status(500).end("error");
    }
})

///////////////////////////////////////////////////////////////////////
/// Query the status of the workitem
///////////////////////////////////////////////////////////////////////
router.get('/da4revit/v1/revit/:workitem_id', async (req, res, next) => {
    const workitemId = req.params.workitem_id;
    try {
        const oauth = new OAuth(req.session);
        const oauth_client = oauth.get2LeggedClient();;
        const oauth_token = await oauth_client.authenticate();
        let workitemRes = await getWorkitemStatus(workitemId, oauth_token.access_token);
        res.status(200).end(JSON.stringify(workitemRes.body));
    } catch (err) {
        res.status(500).end("error");
    }
})


///////////////////////////////////////////////////////////////////////
///
///////////////////////////////////////////////////////////////////////
router.post('/callback/designautomation', async (req, res, next) => {
    // Best practice is to tell immediately that you got the call
    // so return the HTTP call and proceed with the business logic
    res.status(202).end();

    let workitemStatus = {
        'WorkitemId': req.body.id,
        'Status': "Success",
        'ExtraInfo': null
    };
    if (req.body.status === 'success') {
        const workitem = workitemList.find((item) => {
            return item.workitemId === req.body.id;
        })

        if (workitem === undefined) {
            console.log('The workitem: ' + req.body.id + ' to callback is not in the item list')
            return;
        }
        let index = workitemList.indexOf(workitem);

        if (workitem.createVersionData != null) {
            workitemStatus.Status = 'Success';
            global.MyApp.SocketIo.emit(SOCKET_TOPIC_WORKITEM, workitemStatus);
            console.log("Starting to post handle the DA workitem:  " + workitem.workitemId);
            try {
                const versions = new VersionsApi();
                version = await versions.postVersion(workitem.projectId, workitem.createVersionData, req.oauth_client, workitem.access_token_3Legged);
                if (version === null || version.statusCode !== 201) {
                    console.log('Falied to create a new version of the file');
                    workitemStatus.Status = 'Failed'
                } else {
                    console.log('Successfully created a new version of the file');
                    workitemStatus.Status = 'Completed';
                }
            } catch (err) {
                console.log(err);
                workitemStatus.Status = 'Failed';
            }
        } else if (workitem.objectInfo) {
            // Call to generate download link for exported DWG.
            console.log("Starting to create the signed S3 download link:  " + JSON.stringify(workitem.objectInfo));
            try {
                const objectApi = new ObjectsApi();
                const downloadInfo = await objectApi.getS3DownloadURL( workitem.objectInfo.BucketKey, workitem.objectInfo.ObjectKey, null, req.oauth_client, workitem.access_token_2Legged );
                workitemStatus.Status = 'Completed';
                workitemStatus.ExtraInfo = downloadInfo.body.url;
            } catch (err) {
                console.log("Failed to upload the output excel due to " + err);
                workitemStatus.Status = 'Failed';
            }
        } else {
            workitemStatus.Status = 'Failed';
        }
        global.MyApp.SocketIo.emit(SOCKET_TOPIC_WORKITEM, workitemStatus);
        // Remove the workitem after it's done
        workitemList.splice(index, 1);
    } else {
        // Report if not successful.
        workitemStatus.Status = 'Failed';
        global.MyApp.SocketIo.emit(SOCKET_TOPIC_WORKITEM, workitemStatus);
        console.log(req.body);
    }
    return;
})



module.exports = router;
