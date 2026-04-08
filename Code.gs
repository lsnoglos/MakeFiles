/**
 * Web app entrypoint.
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Gestor jerárquico de carpetas');
}

/**
 * Utility for HTML templating.
 * @param {string} filename
 * @returns {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Returns root-level folders in My Drive.
 * @returns {{id: string, name: string}[]}
 */
function getRootFolders() {
  var iter = DriveApp.getRootFolder().getFolders();
  var items = [];

  while (iter.hasNext()) {
    var folder = iter.next();
    items.push({
      id: folder.getId(),
      name: folder.getName()
    });
  }

  items.sort(function(a, b) {
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  });

  return items;
}

/**
 * Loads a hierarchy from an existing folder.
 * @param {string} folderId
 * @returns {{id: string, name: string, children: object[]}}
 */
function loadHierarchyFromFolder(folderId) {
  var folder = DriveApp.getFolderById(folderId);
  return mapFolderToNode_(folder);
}

/**
 * Creates/updates folders according to the provided hierarchy.
 * If rootId is empty, all nodes are applied to My Drive root.
 * @param {{rootId: string, tree: object[]}} payload
 * @returns {{created: number, updated: number, reused: number}}
 */
function applyHierarchy(payload) {
  if (!payload || !Array.isArray(payload.tree)) {
    throw new Error('No se recibió una jerarquía válida.');
  }

  var counters = { created: 0, updated: 0, reused: 0 };

  if (payload.rootId) {
    var rootFolder = DriveApp.getFolderById(payload.rootId);
    upsertChildren_(rootFolder, payload.tree, counters);
    return counters;
  }

  var driveRoot = DriveApp.getRootFolder();
  upsertChildren_(driveRoot, payload.tree, counters);
  return counters;
}

/**
 * Recursively maps a folder into tree node shape.
 * @param {GoogleAppsScript.Drive.Folder} folder
 * @returns {{id: string, name: string, children: object[]}}
 */
function mapFolderToNode_(folder) {
  var node = {
    id: folder.getId(),
    name: folder.getName(),
    children: []
  };

  var subFolders = [];
  var iter = folder.getFolders();

  while (iter.hasNext()) {
    subFolders.push(iter.next());
  }

  subFolders.sort(function(a, b) {
    return a.getName().localeCompare(b.getName(), 'es', { sensitivity: 'base' });
  });

  for (var i = 0; i < subFolders.length; i++) {
    node.children.push(mapFolderToNode_(subFolders[i]));
  }

  return node;
}

/**
 * Upserts a list of child nodes under a parent folder.
 * @param {GoogleAppsScript.Drive.Folder} parentFolder
 * @param {object[]} nodes
 * @param {{created: number, updated: number, reused: number}} counters
 */
function upsertChildren_(parentFolder, nodes, counters) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var name = (node.name || '').trim();

    if (!name) {
      continue;
    }

    var folder = null;

    if (node.id) {
      try {
        folder = DriveApp.getFolderById(node.id);
        if (folder.getName() !== name) {
          folder.setName(name);
          counters.updated++;
        } else {
          counters.reused++;
        }
      } catch (err) {
        folder = null;
      }
    }

    if (!folder) {
      var existing = parentFolder.getFoldersByName(name);
      if (existing.hasNext()) {
        folder = existing.next();
        counters.reused++;
      } else {
        folder = parentFolder.createFolder(name);
        counters.created++;
      }
    }

    if (Array.isArray(node.children) && node.children.length) {
      upsertChildren_(folder, node.children, counters);
    }
  }
}
