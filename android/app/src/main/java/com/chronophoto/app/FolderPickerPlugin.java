package com.chronophoto.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import androidx.documentfile.provider.DocumentFile;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "FolderPicker")
public class FolderPickerPlugin extends Plugin {
    private static final int REQUEST_CODE_OPEN_DOCUMENT_TREE = 90210;
    private static final int REQUEST_CODE_OPEN_DOCUMENT = 90211;
    private PluginCall savedCall;

    @PluginMethod
    public void pickFolder(PluginCall call) {
        this.savedCall = call;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        getActivity().startActivityForResult(intent, REQUEST_CODE_OPEN_DOCUMENT_TREE);
    }

    @PluginMethod
    public void pickFiles(PluginCall call) {
        this.savedCall = call;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        getActivity().startActivityForResult(intent, REQUEST_CODE_OPEN_DOCUMENT);
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQUEST_CODE_OPEN_DOCUMENT_TREE && requestCode != REQUEST_CODE_OPEN_DOCUMENT) {
            return;
        }
        if (savedCall == null) {
            return;
        }
        if (data == null || data.getData() == null) {
            // If no data, resolve with empty result
            savedCall.reject("No selection");
            savedCall = null;
            return;
        }
        JSObject ret = new JSObject();

        if (requestCode == REQUEST_CODE_OPEN_DOCUMENT_TREE) {
            Uri treeUri = data.getData();
            final int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            try {
                getContext().getContentResolver().takePersistableUriPermission(treeUri, takeFlags);
            } catch (Exception e) {
                // ignore
            }
            ret.put("uri", treeUri.toString());

            try {
                DocumentFile pickedDir = DocumentFile.fromTreeUri(getContext(), treeUri);
                if (pickedDir != null && pickedDir.isDirectory()) {
                    List<JSObject> children = new ArrayList<>();
                    for (DocumentFile file : pickedDir.listFiles()) {
                        JSObject f = new JSObject();
                        f.put("name", file.getName());
                        f.put("isDirectory", file.isDirectory());
                        Uri fileUri = file.getUri();
                        f.put("uri", fileUri != null ? fileUri.toString() : null);
                        children.add(f);
                    }
                    ret.put("children", children);
                }
            } catch (Exception e) {
                // ignore enumeration errors
            }
        } else if (requestCode == REQUEST_CODE_OPEN_DOCUMENT) {
            // Multiple files selected from providers (Google Drive / OneDrive)
            List<JSObject> children = new ArrayList<>();
            try {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    for (int i = 0; i < count; i++) {
                        Uri fileUri = data.getClipData().getItemAt(i).getUri();
                        JSObject f = new JSObject();
                        f.put("name", fileUri.getLastPathSegment());
                        f.put("isDirectory", false);
                        f.put("uri", fileUri.toString());
                        children.add(f);
                    }
                } else if (data.getData() != null) {
                    Uri fileUri = data.getData();
                    JSObject f = new JSObject();
                    f.put("name", fileUri.getLastPathSegment());
                    f.put("isDirectory", false);
                    f.put("uri", fileUri.toString());
                    children.add(f);
                }
            } catch (Exception e) {
                // ignore
            }
            ret.put("children", children);
        }

        savedCall.resolve(ret);
        savedCall = null;
    }
}
