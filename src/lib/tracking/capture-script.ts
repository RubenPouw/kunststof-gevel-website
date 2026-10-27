/**
 * Draait bij het parsen van de pagina, vóór React de query uit de adresbalk haalt.
 * Alleen first-party: de klikcode blijft in sessionStorage van dit tabblad.
 */
export const CLICK_CAPTURE_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search);var keys=["gclid","gbraid","wbraid"];var found={};var any=false;for(var i=0;i<keys.length;i++){var v=q.get(keys[i]);if(v&&/^[A-Za-z0-9._-]{8,128}$/.test(v)){found[keys[i]]=v;any=true;}}if(!any)return;var prev={};try{prev=JSON.parse(sessionStorage.getItem("kg-ads-pending")||"{}")||{};}catch(e){}sessionStorage.setItem("kg-ads-pending",JSON.stringify(Object.assign({},prev,found)));}catch(e){}})();`;
