console.log("fonction7", window.location.href,context);

// CONSTANTS
const pathParts = window.location.pathname.split("/").filter(Boolean);
const currentPathRoot = pathParts[0] || "";
const currentSubPath = pathParts[1] || null;

// VARIABLES
const basePath = window.location.origin + "/" + currentPathRoot;

console.log("currentPath", currentPathRoot , currentSubPath);
// CONDITIONS
if(currentPathRoot ==='demandes' && !currentSubPath){
    window.location.replace(
        basePath + "/new/5d7b4e39-c50a-428c-87ec-e9b68ac45e39/32ddfba3-cfba-44f6-8fea-f6cc5fa09472"
    );
}
if(currentPathRoot ==='demandes' && currentSubPath ==='Demandes_Donn%C3%A9esS%C3%A9curis%C3%A9es'){
    window.location.replace(
        basePath + "/new/5d7b4e39-c50a-428c-87ec-e9b68ac45e39/74376794-3805-4012-ad7b-3787eb2e9134"
    );
}
