# Firebase Migration Runbook

Target project: `velmont-website-1d23f`

## Prepare

1. Enable Firebase Authentication and create the production admin user in the target project.
2. Create a read-only service account for the source project and an Admin SDK service account for the target project. Keep both JSON files outside this repository.
3. Copy the current `.env` to a local backup. Add the target web configuration to Vercel Preview environment variables before changing Production.
4. Deploy the versioned rules and indexes to the target project:

```powershell
firebase use velmont-website-1d23f
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Rehearse And Migrate

Run a dry run first. The report is ignored by git.

```powershell
$env:OLD_FIREBASE_SERVICE_ACCOUNT = 'C:\secure\old-firebase.json'
$env:NEW_FIREBASE_SERVICE_ACCOUNT = 'C:\secure\new-firebase.json'
$env:OLD_FIREBASE_STORAGE_BUCKET = 'old-project.appspot.com'
$env:NEW_FIREBASE_STORAGE_BUCKET = 'velmont-website-1d23f.firebasestorage.app'
$env:DRY_RUN = '1'
npm run migrate-firebase
```

Review `migration-report.json`, clear `DRY_RUN`, and run the same command again. The command copies all Firestore documents while preserving IDs, copies non-image Storage files, converts project JPG/PNG files to WebP, and rewrites recognized Firebase download URLs in Firestore.

## Validate And Cut Over

1. Compare source and destination document counts and inspect report failures.
2. Test a Vercel Preview deployment: public project pages, gallery, admin login, uploads, browsing, replacement, and deletion.
3. Verify every project image serves from the new bucket and no document still references the source bucket.
4. Promote the already-tested Firebase variables to Vercel Production. Keep the old project and prior variables until the rollback window closes.

Rollback is restoring the previous Vercel Firebase variables and redeploying. The migration command never deletes source data or legacy files.
