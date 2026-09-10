const MODEL_PATH = "./assets/models/object.glb";
const USDZ_PATH = "./assets/models/object.usdz";

const container = document.querySelector("#three-container");
const status = document.querySelector("#model-status");
const arStatus = document.querySelector("#ar-status");

function setStatus(text){ if(status) status.textContent = text; }

async function initViewer(){
  if(!container) return;
  try{
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");
    const {OrbitControls} = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js");
    const {GLTFLoader} = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js");

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e6df);

    const camera = new THREE.PerspectiveCamera(32, container.clientWidth/container.clientHeight, .01, 1000);
    camera.position.set(2,1.4,3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .07;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .7;
    controls.minDistance = .1;
    controls.maxDistance = 100;

    scene.add(new THREE.HemisphereLight(0xffffff,0x888888,2.2));
    const key = new THREE.DirectionalLight(0xffffff,3);
    key.position.set(3,5,4); key.castShadow = true; scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff,1.2);
    fill.position.set(-4,2,-2); scene.add(fill);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(MODEL_PATH);
    const model = gltf.scene;
    model.traverse(o => { if(o.isMesh){o.castShadow=true;o.receiveShadow=true;} });
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    const maxDim = Math.max(size.x,size.y,size.z);
    const targetSize = 2.15;
    model.scale.setScalar(targetSize / maxDim);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const radius = Math.max(scaledSize.x,scaledSize.y,scaledSize.z);
    camera.position.set(radius*1.6,radius*1.05,radius*1.8);
    camera.near = Math.max(.001,radius/100);
    camera.far = radius*100;
    camera.updateProjectionMatrix();
    controls.target.set(0, scaledSize.y*.05, 0);
    controls.maxDistance = radius*5;
    controls.minDistance = radius*.35;

    setStatus("GLB cargado");
    let interacted = false;
    controls.addEventListener("start",()=>{interacted=true;controls.autoRotate=false;});
    controls.addEventListener("end",()=>{setTimeout(()=>{if(!document.hidden) controls.autoRotate=true;},1200);});

    const resize = ()=>{
      const w=container.clientWidth,h=container.clientHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    };
    window.addEventListener("resize",resize);

    const clock = new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate);
      controls.update(clock.getDelta());
      renderer.render(scene,camera);
    }
    animate();
  }catch(error){
    console.warn("NexiCare 3D viewer fallback:", error);
    setStatus("Visor disponible cuando se agregue el GLB");
    // HTML fallback remains visible if the model/CDN/WebGL fails.
  }
}

async function checkAR(){
  const links = [...document.querySelectorAll(".ar-link")];
  try{
    const response = await fetch(USDZ_PATH,{method:"HEAD",cache:"no-store"});
    if(!response.ok) throw new Error("USDZ not found");
  }catch{
    links.forEach(link=>{
      link.removeAttribute("href");
      link.removeAttribute("rel");
      link.setAttribute("aria-disabled","true");
      link.addEventListener("click",e=>e.preventDefault());
    });
    if(arStatus) arStatus.textContent="La experiencia de realidad aumentada estará disponible próximamente. Cuando se agregue el USDZ, el enlace quedará conectado a Apple Quick Look.";
  }
}

document.addEventListener("DOMContentLoaded",()=>{initViewer();checkAR();});
