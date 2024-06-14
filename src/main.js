//////////////////  Aranda\lasch
//////////////////  Jesse Bassett
//////////////////  11/16/2022 v9.5.3
BULK = false;


class SeedReloaderFX{
  constructor(lookup = "AL App Primitives", manifoldKey = "nextSeed"){
    this.storageLookup = lookup // key in session storage
    this.mKey = manifoldKey     // Manifold Key that holds the next seed. found in M.var[this.mKey] 
    this.v = true
    this.seed
    this.injected = false
  }
  initalize(currentSeed){
    // check if in storage, otherwise set to current seed
    // remove from local storage if retived. 
    console.log("sessionStorage",sessionStorage)

    if(this.checkSessionSorageItem(this.storageLookup) && currentSeed !== this.getSessionStorageItem(this.storageLookup)){
      if(this.v){console.log("new Seed:",this.seed )}
      this.injected = true
      this.seed = this.getSessionStorageItem(this.storageLookup)
      // R = new Random(this.seed ); 
      fxrand = new fxSeed(this.seed ); 
      // remove from storage
      this.removeSessionStorageItem(this.storageLookup)
    }else{
      if(this.v){console.log("noSeed")}
      this.seed = currentSeed
    }
  }
  inject(){
    if(this.injected){
      M.seed = this.seed
      M.var[this.mKey] = M.seed// set equal to current seed for UI display
    }else{
      M.var[this.mKey] = M.seed// set equal to current seed for UI display
    }
  }
  setNextSeed(){
    // M.var[this.mKey] gets set from update function thang
    // verify cstr is clean

    M.var[this.mKey] = this.cleanString(M.var[this.mKey])
    // set local storage item
    this.setSessionStorageItem(this.storageLookup, M.var[this.mKey])
    // trigger reload
    reloadPage()
  }
  cleanString(str){ // verify right length and prefix. 
    const len = 49 + 2
    str = str.replace(/[^a-zA-Z0-9]/g, '');

    // Ensure starts with 0x  // fx says to use "oo" but thats not the case with Henges seeds? 
    // if(!str.startsWith("o")){
    //   str  = "o" + str
    // }

    while(str.length < len){// fill
      str = str + "0"
    }
    if(str.length > len){      //remove
      str = str.substr(0, len)
    }
    
    return str
  }

  checkSessionSorageItem(key){
    return sessionStorage.getItem(key) !== null;
  }
  setSessionStorageItem(key, value) {// Set item in sessionStorage
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  getSessionStorageItem(key) {// Get item from sessionStorage
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  removeSessionStorageItem(key) {// Remove item from sessionStorage
    sessionStorage.removeItem(key);
  }
}

// UI
let sReload = new SeedReloaderFX("AL App Henge", "nextSeed")
sReload.initalize(fxhash)


document.oncontextmenu = () => false;
//class for stack attributes
class Stackattributes{
  constructor() {
    this.name,
    this.x,//x position
    this.y,//y position
    this.category,//category to effect attribute generation
    this.stoneAmount = [],//how many stones in the stack
    this.stoneLength = [],//list of stone lenghts
    this.stoneWidth = [],//list of stone Widths
    this.stoneHeight = [],//list of stone Heights
    this.colors = [], 
    this.rotation = [],
    this.VoronoiIndex =[]
  } 
}   
 
//class for stack attributes
class Plotattributes{
  constructor(_category,_size,_density,_stackAmount,_scaling,_stackCategory) {
    this.category = _category,//type of generation
    this.size = _size,//size/scale
    this.density = _density,//density of stacks
    this.amount = _stackAmount,//number of stacks
    this.stack =[],
    this.x = [],//List of X for stacks
    this.y = [],//List of Y for stacks
    this.scaling = _scaling, 
    this.stackCategory = _stackCategory;
  }
}

class Vegattributes{
  constructor(_Method,_category,_size,_density,_scaleMult,_style) {
    this.category = _category,
    this.style = _style,
    this.size = _size+200,
    this.density = _density;
    this.amount = Math.round( this.size * this.density ),
    this.x = [],
    this.y = [],

    this.strokeFlag = false,
    this.weightFlag = false,
    this.fillFlag   = false,

    this.strokes = [],
    this.weights = [],//rList(this.amount ,0,255),
    this.fills = [],

    this.grassScaleList = rList(this.amount ,-8*_scaleMult,-12*_scaleMult),
    this.rotateList = rList(this.amount ,0,Math.PI*2),
    this.z = rList(this.amount ,0,30)

    ///////////////////////////////////////////////////////PLOT
    if (this.category == 'frustrum'){
      this.category = 'large';
    }

    if (this.category == 'circle'){//CIRCLE
      for (let i = 0; i < this.amount; i++){
        let tempT = rList(1,0,Math.PI*2);
        let tempR = rListWeight(1,0,this.size,.5);
        this.x.push(tempR*Math.cos(tempT));
        this.y.push(tempR*Math.sin(tempT));
      }
    }

    if (this.category == 'disk') {//disk
      let n = 3; // radus mult for outer circle
      this.amount *= n*n-1;
      for (let i = 0; i < this.amount; i++) {
        let tempT = rList(1, 0, Math.PI * 2)[0];
        let tempR = rListPow(1, this.size, this.size*n, .5)[0];
        this.x.push(tempR * Math.cos(tempT));
        this.y.push(tempR * Math.sin(tempT));
      }
    }



    if (this.category == 'large') {//LARGE
      let n = 5;
      this.amount *= n*n;
      for (let i = 0; i < this.amount; i++) {
        let tempT = rList(1, 0, Math.PI * 2);
        let tempR = rListWeight(1, 0, this.size* n , .5);
        this.x.push(tempR * Math.cos(tempT));
        this.y.push(tempR * Math.sin(tempT));
      }
    }


    if (this.category == 'frustrum'){ // DONT USE THIS IT SUCKS
      this.x = rListPow(this.amount,  cams[camIndx].O[2]+cams[camIndx].height/Math.sqrt(3)  , -40*cams[camIndx].O[2]  ,10);
      this.y = rList(this.amount,-30000,30000);
      //for (let i = 0; i < this.amount; i++){
       // this.y = this.y * (   -(this.x-cams[camIndx].O[2]+cams[camIndx].height/Math.sqrt(3))/ 40*cams[camIndx].O[2]        );
      //}
    }

    ////////////////////////////////////////////////////////RENDER
    //clamp(

    if(this.style == "grad1"){
      this.strokeFlag = true;
      this.weightFlag = true;
      this.fillFlag = false;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(.65,.8) ));
        this.weights.push(   clamp(Math.abs((this.x[i] / this.size + 1 * .2), 0, 2)) * rezP / 2   );
        this.fills.push(0);
      } 

    } else if (this.style == "grad2") {
      this.strokeFlag = true;
      this.weightFlag = true;
      this.fillFlag = false;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(.65, .8) ));
        this.weights.push(clamp(Math.abs((this.y[i] / this.size + 1 * .2), 0, 2)) * rezP / 2);
        this.fills.push(0);
      }

    } else if (this.style == "grad3") {
      this.strokeFlag = true;
      this.weightFlag = true;
      this.fillFlag = false;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(.65, .8) ));
        this.weights.push(clamp((this.y[i] / this.size + 1 * .2), 0, 1.5) * rezP / 2);
        this.fills.push(0);
      }

    } else if (this.style == "plain") {
      this.strokeFlag = true;
      this.weightFlag = true;
      this.fillFlag = false;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(.65, .8) ));
        this.weights.push(1);
        this.fills.push(0);
      }


    } else if (this.style == "fill1") {  
      this.strokeFlag = false;
      this.weightFlag = true;
      this.fillFlag = true;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(0);
        this.weights.push(0);
        //this.fills.push([255, 0, 0]); Colors.ground = flatShade(Colors.papercolor, Colors.mults.ground);
        this.fills.push( flatShade(Colors.papercolor, Colors.mults.ground * rand(.6,1.1) )  ); 
      }

    } else if (this.style == "fade") {
      this.strokeFlag = false;
      this.weightFlag = true;
      this.fillFlag = true;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(1.1,1.25) ));
        this.weights.push(((this.x[i] + this.size) / (2 * this.size)) * rezP / 2);
        this.fills.push(0);
      }


    }else{
      this.strokeFlag = true;
      this.weightFlag = true;
      this.fillFlag = false;
      for (let i = 0; i < this.amount; i++) {
        this.strokes.push(flatShade(Colors.papercolor, Colors.mults.ground * rand(1.1,1.25) ));
        this.weights.push(1);
        this.fills.push(0);
      }
    }

    

  }

  myStroke(i){
    if (this.strokeFlag == false){
      noStroke();
    }else{
      stroke( this.strokes[i] );
    }
  } 

  myStrokeWeight(i){  
    if (this.weightFlag == false){
      StrokeWeight(1);
    }else{
      strokeWeight(this.weights[i]);
    }
  }

  myFill(i){
    if (this.fillFlag == false){
      noFill();
    }else{
      fill(this.fills[i]);
      //console.log(this.fills[i]);
    }
  }

  //strokeWeight(){
  //  if (){
  //    strokeWeight();
  //  }
  //}
}

class Category{
  constructor(_arr = [ {name: 'temp', chance: 1, amount: 1, min:0, max:1 } ] ){
    this.count = 400,
    this.arr = _arr,
    this.select = {}
  }
    setByAmount(){
      let sum = 0;
      for (let i = 0; i < this.arr.length; i++){
        sum += this.arr[i].amount
      }
      this.count = sum;
      for (let i = 0; i < this.arr.length; i++){
        this.arr[i].chance = this.arr[i].amount / this.count;
      }
    }

    setByChance(_cnt = this.count){
      let sum = 0;
      for (let i = 0; i < this.arr.length; i++){
        sum += this.arr[i].chance
      }

      if(sum >= 0.9999){
        for (let i = 0; i < this.arr.length; i++){
          this.arr[i].amount = this.arr[i].chance*this.count;
        }

      }else{
        console.log('Improper Sum: ' + sum);//doesn't sum to 1
      }
    }

    sum(){
      let arrMaxtemp = [];
      let arrMintemp = [];
      arrMintemp.push(0);
      for (let i = 0; i < this.arr.length; i++){
        arrMaxtemp.push(this.arr[i].chance);
        arrMintemp.push(this.arr[i].chance);
      }
      arrMintemp.pop();
      arrMaxtemp = partialSum(arrMaxtemp);
      arrMintemp = partialSum(arrMintemp);
      for (let i = 0; i < this.arr.length; i++){
        this.arr[i].min = arrMintemp[i];
        this.arr[i].max = arrMaxtemp[i];
      }
    }

    pickCategory(){
    let param = rand();
    let category;
    for (let i = 0; i < this.arr.length; i++){
      if(this.arr[i].min <= param && param < this.arr[i].max){
        category = this.arr[i].name;
      }
    }
    this.select = {name:category, value:param};
    return {name:category, value:param};
    }

    setCategory(_cat){
      let param = 0;
      let category;
      for (let i = 0; i < this.arr.length; i++){
        if(_cat == this.arr[i].name){
          category = this.arr[i].name;
        }
      }

      this.select = {name:category, value:param};
      return {name:category, value:param};
    }

    setCategoryValue(_val){
      let param;
      let category;
      for (let i = 0; i < this.arr.length; i++){
        if(this.arr[i].min <= _val && _val < this.arr[i].max){
          category = this.arr[i].name;
          param = _val;
        }
      }
      this.select = {name:category, value:param};
      return {name:category, value:param};
    }
}



let plotMaxsize;
let plotMaxHeight;
let UNI = ['LF1','LF2','LR1','LR2','dA1','dA2','df1','df2','wb1','wb2','bb1','bb2','Nf1','Nf2','Nn1','Nn2','Nx1','Nx2','indx','Ld','cBlend'];
let sG = 100.0;
let UNIVAR = [
  [
    [54.640+sG,49.324+sG,40.324+sG,50.+sG], [80.48+sG, 0.],
    [1.57079632679,-0.788,-0.788,-4.668], [3.604, 0.],
    [2.0,100.160,100.160,2.880], [2.880, 0.],
    [147.2,516.8,516.8,589.6], [589.6, 0.],
    [3.424,4.816,4.816,4.056], [3.592, 0.],
    [1.484,0.860,0.860,0.860], [0.860, 0.],
    [40.,43.752,41.752,24.216], [0.0,1.2],
    [-0.020,-0.260,-0.260,0.100], [0., 0.],
    [0.304,0.376,0.376,0.376], [0.,1.],
    1.0, [0., 0., 0., 0.], 0.796,
  ],
  [
    [52.696+sG, 54.324+sG, 55.324+sG, 62.392+sG],[80.48+sG, 0.],
    [0.,0.796,1.640,3.196],[5.332, 5.],
    [11.712, 100.160, 100.160, 2.880],[2.880, 0.],
    [247.2, 516.8, 516.8, 589.6],[589.6, 0.],
    [2.904, 3.608, 3.192, 3.224],[3.592, 0.],
    [1.484, 0.860, 0.860, 0.860],[0.860, 0.],
    [16.376, 35.832, 36.136, 3.312],[4.152, -1.152],
    [0.0, 0.220, -0.124, 0.100],[0.100, 0.1],
    [0.0, 0.400, 0.560, 1.128],[1.128, 1.],
    2.0, [0., 0., 0., 0.], 0.796
  ],
  [
    [54.640+sG, 49.324+sG, 49.324+sG, 49.284+sG], [80.48+sG, 0.],
    [0., 1.580, 4.548, 2.316], [3.604, 0.],
    [11.712, 100.160, 100.160, 98.696], [2.880, 0.],
    [247.2, 516.8, 516.8, 621.6], [589.6, 0.],
    [3.488, 3.088, 3.056, 3.848], [3.592, 0.],
    [1.484, 0.860, 0.860, 0.860], [0.860, 0.],
    [16.376, 35.832, 36.136, 36.136], [4.152, -1.5],
    [-0.00, -0.260, -0.124, -0.124], [0.100, 0.1],
    [0.400, 0.400, 0.560, 0.592], [1.128, 1.],
    3.0, [0., 0., 0., 0.], 0.796
  ],
  [
    [60.320+sG, 49.324+sG, 49.324+sG, 49.284+sG], [80.408+sG, 0.],
    [2.227, 0.836, 6.828, 2.316], [3.932, 0.],
    [11.632, 11.256, 100.160, 98.696], [2.880, 0.],
    [553.6, 290.4, 516.8, 621.6], [589.6, 0.],
    [2.920, 3.840, 3.712, 3.880], [2.832, 0.],
    [0.276, 1.188, 0.860, 0.860], [0.860, 0.],
    [16.376, 35.832, 36.136, 36.136], [4.152, 0.7],
    [0.388, 0.212, -0.124, -0.124], [0.100, 0.1],
    [1.024, 0.424, 0.560, 0.592], [1.544, 1.],
    4.0, [-0.168, 2.336, 1.506, 0.952], 0.810
  ],
  [
    [53.720+sG, 46.468+sG, 49.324+sG, 49.284+sG], [50.352+sG, 0.],
    [3.963, 2.032, 6.876, 0.100], [2.604, 0.],
    [13.384, 11.112, 100.160, 98.696], [3.240, 0.],
    [487.2, 290.4, 516.8, 621.6], [589.6, 0.],
    [2.696, 2.808, 2.488, 2.960], [1.464, 0.],
    [0.196, 1.188, 0.900, 0.860], [0.860, 0.],
    [16.376, 35.832, 24.264, 33.872], [3.200, -.8],
    [0.572, 0.212, -0.124, -0.124], [-0.084, 0.05],
    [0.976, 0.656, 0.480, 0.592], [1.816, 0.9],
    5.0, [0.630,0.378,0.601,3.632], 0.924
  ],
  [
    [58.408+sG, 46.468+sG, 53.916+sG, 51.336+sG], [40.424+sG, 0.],
    [4.707, 1.104, 6.676, 2.596], [2.980, 0.],
    [12.208, 10.120, 100.160, 98.704], [2.880, 0.],
    [578.4, 290.4, 516.8, 621.6], [589.6, 0.],
    [1.156, 2.376, 2.376, 2.168], [2.208, 0.],
    [0.708, 1.188, 0.860, 0.860], [0.860, 0.],
    [18.168, 40.832, 25., 3.136], [3.112, 1.112],
    [0.108, 0.212, -0.124, -0.116], [0.100, 0.100],
    [1.304, 0.512, 0.560, 1.072], [1.104, 1.104],
    6.0, [0., 0., 0., 0.], 0.796
  ],
  [
    [60.320+sG, 60.324+sG, 61.692+sG, 61.336+sG], [50.424+sG, 0.],
    [2.091, 0.796, 4.724, 2.596], [4.788, 0.],
    [18.376, 10.544, 100.160, 98.704], [2.880, 0.],
    [553.6, 444.0, 516.8, 621.6], [589.6, 0.],
    [1.616, 2.280, 2.720, 2.312], [1.776, 0.],
    [1.484, 1.188, 0.860, 0.860], [0.860, 0.],
    [16.744, 35.832, 36.136, 3.136], [4.336, 0.],
    [0.388, 0.212, -0.508, -0.124], [0.100, 0.],
    [1.096, 1.248, 1.360, 0.592], [1.768, 0.],
    7.0, [0., 0., 0., 0.], 0.796,
  ],
  [
    [60.320+sG, 80.324+sG, 51.692+sG, 60.368+sG],[1.+sG, 0.],
    [6.427, 1.012, 6.828, 4.836],[1., 0.],
    [11.632, 10.056, 100.160, 98.696],[4., 0.],
    [553.6, 444., 516.8, 621.6],[0.4, 0.],
    [1.440, 0.920, 2.256, 2.024],[0.2, 0.],
    [1.484, 1.188, 0.860, 0.860],[0.2, 0.],
    [16.160, 35.832, 36.136, 3.136],[0.1, 0.],
    [0.388, 0.212, -0.508, -0.124],[0., 0.],
    [1.096, 1.248, 1.784, 0.496],[0., 0.],
    8.0, [0., 0., 0., 0.], 0.796,
  ],/*
  [
    myHatch[1].slice(0,4),myHatch[1].slice(4),
    myHatch[2].slice(0,4),myHatch[2].slice(4),
    myHatch[3].slice(0,4),myHatch[3].slice(4),
    myHatch[4].slice(0,4),myHatch[4].slice(4),
    myHatch[5].slice(0,4),myHatch[5].slice(4),
    myHatch[6].slice(0,4),myHatch[6].slice(4),
    myHatch[7].slice(0,4),myHatch[7].slice(4),
    myHatch[8].slice(0,4),myHatch[8].slice(4),
    myHatch[9].slice(0,4),myHatch[9].slice(4),
    myHatch[0][4], myHatch[0].slice(0,4),  myHatch[0][5],
  ],*/
];

//////////////////////////////////////////////////////////////GLOBAL VARIABLES//////////////////////////////////////////////////////////////
let layout = { alpha:0.025, beta:0.03, x:0, y:0, p_w:0, p_h:0, p_m:10, p_p:10, p_O:0, p_mT:0, p_mL:0, border:1, can_w:100, can_h:100, can_m:20, sldr_w:100, sldr_h:100, sldr_m:20,};
let DIM = Math.floor(Math.min(window.innerWidth,window.innerHeight));
//console.log(window.innerHeight )
let rezX = 800;
let rezY = 800;
let rezP = 2;//pixel denity DONT go larger than 4
let canvas;
let FULLSCREEN = false;
let prtScn = false;
let printNEXT = false;
let isLooping = true;
if (BULK){ isLooping = false; };
//Lighting
let sun = new p5.Vector(1, -1, -1);
sun.normalize();

//var to increment image save names
let sketchNum = 0;
let sketchNum2 = 0;

//Debug vars
let showGrid = false;

//Geometry generation
let plot = [];
let stackList = [];


let plotCategories = ['circle','disk','axialSym','radialSym','ring','grid','row','axis','packedRings','packedCurve'];
plotCategories.pop();//no packed versions yet
plotCategories.pop();
let stackCategories = ['regular','tall','short','big','long','thin','sorted','centered','bowl','cone'];
stackCategories.pop();//remove unimplimented categories
stackCategories.pop();
stackCategories.pop();
stackCategories.pop();


let plotCollection = [];
let stackCollection = [];

//Mesh stuff
let go = [];
let geom = [];
let img;
let goS_p =[];
let goS = [];
let geomS = [];

//landscape
let drawGrass = true;
let grass = [];// list of used meshes
let grassLibrary = [];//list of all meshes
let gd = [];//list of grass used grass density
let gdl = [];//list of all grass densities
let gs = [1,1,1,1,1,1,1,2,1];//list of grass scalars

let vegPlot = [];// list of transforms

let renderFlag = true;

let papercolor = [];
let papercolor2 = [];
let papercolor3 = [];

let sunlock = false;

let cView = [Math.PI / 4, Math.PI / 4, 6000];// cam angles
let cHeight = 500;//5000,9000; // cam height
let cType;
let cOffset;
let DRAWSKY = true; 

let mobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  mobile = true;
} 



let S = 2.5;// stone scale // T
let viewOrg = [9,5,9,4];
let viewOrgIndx = 0;
let camIndx = 0;
let CurCAM;// do i need this?

let printList = [ "Perspective", "Perspective", "Landscape Perspective", "Plan", "Elevation", "Isometric", "Plan Perspective"];
//let plotTitles = ['Circle', 'Disk', 'AxialSym', 'RadialSym', 'Ring', 'Grid', 'Row', 'Axis', "None"];
let plotTitles = ['Noise', 'Doughnut', 'Vertical Symmetry', 'Bi-Axial Symmetry', 'Ring', 'Grid', 'Row', 'Radial Symmetry', "None"];
let duoFeature = "Duotone"; //Pen / DuoTone

let cams = [
  //perspective 
  { O: [0, 0, 10000], height: 900, type: "frustrum", BkFlag: true, horizon: 0.33333/* rand(.2,.5)*/, OrthGround:false,  },
  //perspective
  { O: [0, 0, 12500], height: 300, type: "frustrum", BkFlag: true, horizon: 0.33333, OrthGround:false,  },
  //Landscape perspective
  { O: [0, 0, 30000], height: 750, type: "frustrum", BkFlag: true, horizon: 0.33333,OrthGround:false,  },
  //plan
  { O: [0, Math.PI / 2, 19000], height: 0, type: "ortho", BkFlag: false, horizon: 0.5, OrthGround: false,  },
  //elevation
  { O: [Math.PI / 4, 0, 10000], height: 0, type: "ortho", BkFlag: false, horizon: 0.5, OrthGround:false,  },
  //axon
  { O: [Math.PI / 4, Math.PI / 4, 20000], height: 900, type: "ortho", BkFlag: false, horizon: 0.5, OrthGround: false,  },
  //plan perspective
  { O: [0, Math.PI / 2, 19000], height: 0, type: "frustrum", BkFlag: false, horizon: 0.5, OrthGround: false,  },

];

let Colors = {
  papercolor:null,
  papercolor2:null,
  papercolor3:[0,0,0],
  duotone:null,

  papergrey:null,
  
  mults:{
    stone: 1 / 1,
    ground: 1 / 2,
    shadow: 1 / 3,
    skyfill: 1 / 1,
  },
  stone:[],
  paper: [],
  ground: [], 
  shadow: [], 
  skyfill: [],

  flags:{
    isMultiColor:false,
    isDuotone:false,
  }
}

Gindx = 3;
let Gflag =[
  { models: [1, 2, 3, 6, 5], camType: ["ortho"], gd: [], gs: [], style: ["grad1", "grad1", "grad1", "grad1", "grad1",] },
  { models: [7]            , camType: ["ortho"], gd: [], gs: [], style: ["fill1"] },
  { models: [7, 7]         , camType: ["ortho"], gd: [], gs: [], style: ["fill1", "fill1",] },
  { models: [9, 10],  camType: ["ortho"], gd: [], gs: [],  style:  ["grad1", "grad1"] },
  { models: [11, 12], camType: ["ortho"], gd: [], gs: [], style: ["grad1", "grad1", ] },
];

let MDL = {//model, density library
  models:[],
  density:[],
  modelScale:[],
}

let VPS = [] // veg splot selector

let VPC = { // veg plot controls
  Sindx : 0,
  Lindx: 0,
  Rindx: 0,
  currCam: 0,
}

let TTT = {//
  ind: [],
  sty: [],
  lay: [],
}

let plotViewSize = -1;


let cloudVars = { 
  seed: rand(-1000, 1000),            // seed for cloud noise
  mult1: rand(2, 18),                 // scale of noise
  mult2: rand(5, 12),                 // scale of multipl
  horizon: cams[camIndx].horizon,     // horion high in Screen space
  hengeHighlight: 1000,
  shadowStrength: 6,                  // shadow darkness
  ground: .5,                         // ground darkness
  lineWeightMult: 1.0,                // scalar for lineWeight of clouds
  clear:2,
  night:2,
}    

let zoomFactor = 1;
let multiCOLOR = false; 



// UI
let M = {var:{}}
window.M = M

M.seed = fxhash
sReload.inject()

//////////////////////////////////////////////////////////////CATEGORIES//////////////////////////////////////////////////////////////
let plotCategoryNames = [  // USED FOR NAMES ONLY
  {name: 'circle', chance: 0, amount: 1, min:0, max:0 },
  {name: 'disk', chance: 0, amount: 1, min:0, max:0 },
  { name: 'axialSym', chance: 0, amount: 1, min: 0, max: 0 }, 
  { name: 'radialSym', chance: 0, amount: 1, min: 0, max: 0 }, 
  {name: 'ring', chance: 0, amount: 1, min:0, max:0 },
  {name: 'grid', chance: 0, amount: 1, min:0, max:0 },
  {name: 'row', chance: 0, amount: 1, min:0, max:0 },
  {name: 'axis', chance: 0, amount: 1, min:0, max:0 },
];
let plotCategoryZZZ = new Category(plotCategoryNames);
plotCategoryZZZ.setByAmount();
plotCategoryZZZ.sum();
//console.log(plotCategoryZZZ.pickCategory().name);

let plotController = {
  num: 1,
  string: ["circle"],
  indx: [0]
}


//let stackCategories = ['regular','tall','short','big','long','thin','sorted','centered','bowl','cone'];
let stackCategoriesNames = [
  {name: 'regular', chance: 0, amount: 1, min:0, max:0 },
  {name: 'tall', chance: 0, amount: 1, min:0, max:0 },
  {name: 'short', chance: 0, amount: 1, min:0, max:0 },
  {name: 'big', chance: 0, amount: 1, min:0, max:0 },
  {name: 'long', chance: 0, amount: 1, min:0, max:0 },
  //
  {name: 'thin', chance: 0, amount: 1, min:0, max:0 },
  {name: 'simple', chance: 0, amount: 1, min:0, max:0 },
  
];

let stackCategoryZZZ = new Category(stackCategoriesNames);
stackCategoryZZZ.setByAmount();
stackCategoryZZZ.sum();
//console.log(stackCategoryZZZ.pickCategory().name);


//////////////////////////////////////////////////////////NEW CATEGORIES/////////////////////////////////////////////////////////////
/*let StoneScaleLib = [
  { name: 'small', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'medium', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'large', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'vast', chance: 0, amount: 1, min: 0, max: 0 },
];*/
let camLib = [
  { name: 'Perspective', chance: .17, amount: 0, min: 0, max: 0 },        //perspective 1
  { name: 'Perspective', chance: .18, amount: 0, min: 0, max: 0 },        //perspective 2
  { name: 'Landscape Perspective', chance: 0.15, amount: 0, min: 0, max: 0 },        //Landscape perspective
  { name: 'Plan', chance: 0.10, amount: 0, min: 0, max: 0 },       //top
  { name: 'Elevation', chance: 0.15, amount: 0, min: 0, max: 0 }, //side
  { name: 'Isometric', chance: 0.15, amount: 0, min: 0, max: 0 },      //axon
  { name: 'Plan Perspective', chance: 0.10, amount: 0, min: 0, max: 0 },      //axon
];

let perpLib = [
  { name: 'Perspective', chance: 0.35, amount: 1, min: 0, max: 0 },  
  { name: 'Perspective', chance: 0.35, amount: 1, min: 0, max: 0 }, 
  { name: 'Landscape Perspective', chance: 0.3, amount: 1, min: 0, max: 0 }, 
]

let planLib = [
  { name: 'Plan', chance: .5, amount: 1, min: 0, max: 0 },
  { name: 'Plan Perspective', chance: .5, amount: 1, min: 0, max: 0 },
]

let planZoomLib = [
  { name: 'Zoom', chance: .35, amount: 1, min: 0, max: 0 },
  { name: 'Fit', chance: .65, amount: 1, min: 0, max: 0 },
  { name: 'Wide', chance: .3, amount: 0, min: 0, max: 0 },
]

let viewOrderLib = [
  { name: 'Perspective', chance: .70, amount: 1, min: 0, max: 0 },
  { name: 'Isometric', chance: .10, amount: 1, min: 0, max: 0 },
  { name: 'Plan', chance: .10, amount: 1, min: 0, max: 0 },
  { name: 'Elevation', chance: .10, amount: 1, min: 0, max: 0 },
]

let colorLib = [


/*
  { name: 'Midnght Blue', chance: 0,   amount: 0, min: 0, max: 0 },
  { name: 'Corb Blue', chance: 0,      amount: 0, min: 0, max: 0 },
  { name: 'Pink', chance: 0,           amount: 5, min: 0, max: 0 },
  { name: 'Orange', chance: 0,         amount: 2, min: 0, max: 0 },
  { name: 'Burgundy', chance: 0,       amount: 2, min: 0, max: 0 },
  { name: 'Taupe', chance: 0,          amount: 19, min: 0, max: 0 },
  { name: 'Grey Blue', chance: 0,      amount: 4, min: 0, max: 0 },
  { name: 'Baby Blue', chance: 0,      amount: 5, min: 0, max: 0 },
  { name: 'Pool Green', chance: 0,     amount: 2, min: 0, max: 0 },
  { name: 'Mint', chance: 0,           amount: 5, min: 0, max: 0 },
  { name: 'Melon', chance: 0,          amount: 2, min: 0, max: 0 },
  { name: 'White', chance: 0,          amount: 2, min: 0, max: 0 },
  { name: 'Grey', chance: 0,           amount: 14, min: 0, max: 0 },
  { name: 'Black', chance: 0,          amount: 0, min: 0, max: 0 },
*/
/*
  { name: 'Midnght Blue', chance: 0,   amount: 0, min: 0, max: 0 },
  { name: 'Corb Blue', chance: 0,      amount: 0, min: 0, max: 0 },
  { name: 'Pink', chance: 0,           amount: 10, min: 0, max: 0 },
  { name: 'Orange', chance: 0,         amount: 2, min: 0, max: 0 },
  { name: 'Burgundy', chance: 0,       amount: 3, min: 0, max: 0 },
  { name: 'Taupe', chance: 0,          amount: 38, min: 0, max: 0 },
  { name: 'Grey Blue', chance: 0,      amount: 8, min: 0, max: 0 },
  { name: 'Baby Blue', chance: 0,      amount: 10, min: 0, max: 0 },
  { name: 'Pool Green', chance: 0,     amount: 5, min: 0, max: 0 },
  { name: 'Mint', chance: 0,           amount: 10, min: 0, max: 0 },
  { name: 'Melon', chance: 0,          amount: 5, min: 0, max: 0 },
  { name: 'White', chance: 0,          amount: 5, min: 0, max: 0 },
  { name: 'Grey', chance: 0,           amount: 28, min: 0, max: 0 },
  { name: 'Black', chance: 0,          amount: 0, min: 0, max: 0 },
*/
  { name: 'Midnght Blue', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'Corb Blue', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'Pink', chance: 0, amount: 8, min: 0, max: 0 },
  { name: 'Orange', chance: 0, amount: 4, min: 0, max: 0 },
  { name: 'Burgundy', chance: 0, amount: 4, min: 0, max: 0 },
  { name: 'Taupe', chance: 0, amount: 28, min: 0, max: 0 },
  { name: 'Grey Blue', chance: 0, amount: 8, min: 0, max: 0 },
  { name: 'Baby Blue', chance: 0, amount: 11, min: 0, max: 0 },
  { name: 'Pool Green', chance: 0, amount: 3, min: 0, max: 0 },
  { name: 'Mint', chance: 0, amount: 11, min: 0, max: 0 },
  { name: 'Melon', chance: 0, amount: 4, min: 0, max: 0 },
  { name: 'White', chance: 0, amount: 3, min: 0, max: 0 },
  { name: 'Grey', chance: 0, amount: 38, min: 0, max: 0 },
  { name: 'Black', chance: 0, amount: 0, min: 0, max: 0 },

];


let cloudLib = [
  { name: 'Calm', chance: 0, amount: 4, min: 0, max: 0 },
  { name: 'Cloudy', chance: 0, amount: 6, min: 0, max: 0 },
  { name: 'Storm', chance: 0, amount: 4, min: 0, max: 0 },
  { name: 'Clear', chance: 0, amount: 3, min: 0, max: 0 },
  { name: 'Night', chance: 0, amount: 2, min: 0, max: 0 },
];

let grassStyleLib = [
  { name: 'Blank', chance: 0, amount: 5, min: 0, max: 0 },
  { name: 'Etch', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Fill', chance: 0, amount: 1, min: 0, max: 0 },
];

let grassLayoutLib = [
  { name: 'Circle', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Disk', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Uniform', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Mix', chance: 0, amount: 1, min: 0, max: 0 },
];

let grassRenderLib = [ // only used when grassStyleLib.name  = etch
  { name: 'none', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'g1', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'g2', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'g3', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'g4', chance: 0, amount: 1, min: 0, max: 0 },
  
];


let plotCountLib = [ 
  { name: '1', chance: .1, amount: 1, min: 0, max: 0 },
  { name: '2', chance: .5, amount: 1, min: 0, max: 0 },
  { name: '3', chance: .35, amount: 1, min: 0, max: 0 },
  { name: '4', chance: .05, amount: 1, min: 0, max: 0 },
];

let plot01Lib = [ 
  { name: 'circle', chance: 0.05, amount: 1, min: 0, max: 0 },
  { name: 'disk', chance: .2, amount: 1, min: 0, max: 0 },
  { name: 'axialSym', chance: .3, amount: 1, min:0, max:0 },
  { name: 'radialSym', chance: .2, amount: 1, min: 0, max: 0 }, 
  { name: 'ring', chance: .2, amount: 1, min: 0, max: 0 },
  { name: 'grid', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'row', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'axis', chance: 0.05, amount: 1, min: 0, max: 0 },
];

let plot02Lib = [ 
  { name: 'circle', chance: .45, amount: 1, min: 0, max: 0 },
  { name: 'disk', chance: .45, amount: 1, min: 0, max: 0 },
  { name: 'axialSym', chance: 0.025, amount: 1, min:0, max:0 },
  { name: 'radialSym', chance: 0.025, amount: 1, min: 0, max: 0 }, 
  { name: 'ring', chance: 0.025, amount: 1, min: 0, max: 0 },
  { name: 'grid', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'row', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'axis', chance: 0.025, amount: 1, min: 0, max: 0 },
];

let plot03Lib = [ 
  { name: 'circle', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'disk', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'axialSym', chance: 16, amount: 1, min:0, max:0 },
  { name: 'radialSym', chance: 16, amount: 1, min: 0, max: 0 }, 
  { name: 'ring', chance: 20, amount: 1, min: 0, max: 0 },
  { name: 'grid', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'row', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'axis', chance: 16, amount: 1, min: 0, max: 0 },
];

let plot04Lib = [ 
  { name: 'circle', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'disk', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'axialSym', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'radialSym', chance: 16, amount: 1, min: 0, max: 0 },
  { name: 'ring', chance: 20, amount: 1, min: 0, max: 0 },
  { name: 'grid', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'row', chance: 0, amount: 0, min: 0, max: 0 },
  { name: 'axis', chance: 16, amount: 1, min: 0, max: 0 },
];




let cam_cat = new Category(camLib);
let perp_cat = new Category(perpLib);
let plan_cat = new Category(planLib);
let vior_cat = new Category(viewOrderLib);
let zoom_cat = new Category(planZoomLib);

let pltC_cat = new Category(plotCountLib);
let plt1_cat = new Category(plot01Lib);
let plt2_cat = new Category(plot02Lib);
let plt3_cat = new Category(plot03Lib);
let plt4_cat = new Category(plot04Lib);

let col_cat = new Category(colorLib);
let cld_cat = new Category(cloudLib);
let grs_cat = new Category(grassStyleLib);
let gly_cat = new Category(grassLayoutLib);
let grd_cat = new Category(grassRenderLib);


cam_cat.setByChance();
cam_cat.sum();
perp_cat.setByChance();
perp_cat.sum();
plan_cat.setByChance();
plan_cat.sum();
vior_cat.setByChance();
vior_cat.sum();
zoom_cat.setByChance();
zoom_cat.sum();

col_cat.setByAmount();
col_cat.sum();



pltC_cat.setByChance();
pltC_cat.sum();
plt1_cat.setByChance();
plt1_cat.sum();
plt2_cat.setByChance();
plt2_cat.sum();
plt3_cat.setByChance();
plt3_cat.sum();
plt4_cat.setByChance();
plt4_cat.sum();

cld_cat.setByAmount();
cld_cat.sum();
grs_cat.setByAmount();
grs_cat.sum();
gly_cat.setByAmount();
gly_cat.sum();
grd_cat.setByAmount();
grd_cat.sum();


let cam_f = cam_cat.pickCategory().name;
let perp_f = perp_cat.pickCategory().name;
let plan_f = plan_cat.pickCategory().name;
let view_f = vior_cat.pickCategory().name;
let zoom_f = zoom_cat.pickCategory().name;

let pltC_f = pltC_cat.pickCategory().name;
let plt1_f = plt1_cat.pickCategory().name;
let plt2_f = plt2_cat.pickCategory().name;
let plt3_f = plt3_cat.pickCategory().name;
let plt4_f = plt4_cat.pickCategory().name;

let col_f = col_cat.pickCategory().name;
let cld_f = cld_cat.pickCategory().name;
let grs_f = grs_cat.pickCategory().name;
let gly_f = gly_cat.pickCategory().name;
let grd_f = grd_cat.pickCategory().name;

//icam_f = camLib[1].name;

//perp_f = perpLib[2].name;
//view_f = viewOrderLib[0].name;
//col_f = colorLib[10].name;
//cld_f = cloudLib[4].name;
//con_f = contrastLib[2].name;
//grd_f = grassRenderLib[4].name
//cld_f = cloudLib[3].name;


//view_f = viewOrderLib[0].name;
//grd_f = grassRenderLib[4].name
//grs_f = grassStyleLib[1].name;

///////////////////////////////////////////////////////////////Selections////////////////////////////////////////////////////////


if (perp_f == perpLib[0].name) {
  viewOrg[0] = 0;
  plotViewSize = 1;
} else if (perp_f == perpLib[1].name) {
  viewOrg[0] = 1.25;
  plotViewSize = 2;
} else if (perp_f == perpLib[2].name) {
  viewOrg[0] = 2;
  plotViewSize = 3;
}

//plan_f = planLib[1].name;
if (plan_f == planLib[0].name) {
  viewOrg[2] = 3;
} else if (plan_f == planLib[1].name) {
  viewOrg[2] = 6;
}

//console.log(viewOrg)
//view_f = viewOrderLib[2].name;
if (view_f == viewOrderLib[0].name) {//PERSPECTIVE


} else if (view_f == viewOrderLib[1].name) {//AXON
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();

} else if (view_f == viewOrderLib[2].name) {//PLAN
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();


} else if (view_f == viewOrderLib[3].name) {//ELEVATION
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();
  viewOrg.push(viewOrg[0]);
  viewOrg.shift();  

}

camIndx = viewOrg[0];//camSWAP


if (zoom_f == planZoomLib[0].name) {//zoom
  zoomFactor = 0.85; // 0.6

} else if (zoom_f == planZoomLib[1].name) {//fit
  zoomFactor = 1.0;

} else if (zoom_f == planZoomLib[2].name) {//wide
  zoomFactor = 1.45; // 1.7
} 




cloudVars.horizon = cams[camIndx].horizon; //ERROR
//////////////////////////////////////////////////////////////COLOR/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////COLOR/////////////////////////////////////////////////////////////////////////////////////
//col_f = colorLib[17].name;
//DUOTEMP 
Colors.flags.isDuotone = true;
let ColFlagPaper = "null";
  


let DuoColorLib = [
  { name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  { name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },
];

//col_f = colorLib[0].name;
//col_f_DUOTEMP = colorLib[11].name;

if (col_f == colorLib[0].name) {
  papercolor = [0, 28, 113];
  ColFlagPaper = "000P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 0;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 0;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 0;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 3;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },
  
} else if (col_f == colorLib[1].name) {
  papercolor = [43, 125, 225];
  //papercolor = [191, 227, 237];
  ColFlagPaper = "001P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 0;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 1;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 6;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[2].name) {
  papercolor = [254, 188, 203];
  ColFlagPaper = "002P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 0;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 7;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[3].name) {//
  papercolor = [255, 92, 54];
  ColFlagPaper = "003P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 0;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 5;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[4].name) {//
  //papercolor = [156, 24, 47];
  //papercolor = [161, 67, 84];
  papercolor = [153, 24, 46];
    
  ColFlagPaper = "004P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 9;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[5].name) {//
  papercolor = [206, 200, 186];
  ColFlagPaper = "005P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 1;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 9;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[6].name) {//
  papercolor = [162, 178, 201];
  ColFlagPaper = "006P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 0;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 1;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 9;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[7].name) {//
  //papercolor = [152, 202, 236];
  papercolor = [191, 227, 237];
  ColFlagPaper = "007P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 0;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 7;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[8].name) {//
  //papercolor = [0, 100, 80];
  //papercolor = [65, 81, 63];
  papercolor = [0, 105, 84];
  ColFlagPaper = "008P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 9;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[9].name) {//
  papercolor = [237, 253, 220];
  ColFlagPaper = "009P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 9;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[10].name) {//
  papercolor = [236, 190, 92];
  ColFlagPaper = "010P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 7;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[11].name) {//WHITE
  papercolor = [255, 255, 255];
  ColFlagPaper = "011P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 1;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 14;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[12].name) {//GREY
  papercolor = [240, 240, 240];
  ColFlagPaper = "012P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 0;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 0;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 0;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 11;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },

} else if (col_f == colorLib[13].name) {//BLACK
  papercolor = [0, 0, 0];
  ColFlagPaper = "013P";

  DuoColorLib[0].amount = 1;//{ name: 'Midnght Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[1].amount = 1;//{ name: 'Corb Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[2].amount = 1;//{ name: 'Pink', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[3].amount = 1;//{ name: 'Orange', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[4].amount = 1;//{ name: 'Burgundy', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[5].amount = 0;//{ name: 'Taupe', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[6].amount = 0;//{ name: 'Grey Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[7].amount = 0;//{ name: 'Baby Blue', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[8].amount = 1;//{ name: 'Pool Green', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[9].amount = 0;//{ name: 'Mint', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[10].amount = 1;//0{ name: 'Melon', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[11].amount = 0;//1{ name: 'White', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[12].amount = 0;//2{ name: 'Grey', chance: 0, amount: 1, min: 0, max: 0 },
  DuoColorLib[13].amount = 0;//3{ name: 'Black', chance: 0, amount: 1, min: 0, max: 0 },


}



let duo_cat = new Category(DuoColorLib);
duo_cat.setByAmount();
duo_cat.sum();

let col_f_DUO = duo_cat.pickCategory().name;



///////////////////////////////////////////////////////////////////////
ColFlagLine = "null";

if (col_f_DUO == DuoColorLib[0].name) {
  papercolor3 = [0, 28, 113];
  ColFlagLine = "000L";
  

} else if (col_f_DUO == DuoColorLib[1].name) {
  papercolor3 = [43, 125, 225];
  ColFlagLine = "001L";

} else if (col_f_DUO == DuoColorLib[2].name) {
  papercolor3 = [254, 188, 203];
  ColFlagLine = "002L";

} else if (col_f_DUO == DuoColorLib[3].name) {//
  papercolor3 = [255, 92, 54];
  ColFlagLine = "003L";

} else if (col_f_DUO == DuoColorLib[4].name) {//
  papercolor3 = [156, 24, 47];
  ColFlagLine = "004L";

} else if (col_f_DUO == DuoColorLib[5].name) {//
  papercolor3 = [206, 200, 186];
  ColFlagLine = "005L";

} else if (col_f_DUO == DuoColorLib[6].name) {//
  papercolor3 = [162, 178, 201];
  ColFlagLine = "006L";

} else if (col_f_DUO == DuoColorLib[7].name) {//
  papercolor3 = [152, 202, 236];
  ColFlagLine = "007L";

} else if (col_f_DUO == DuoColorLib[8].name) {//
  papercolor3 = [0, 100, 80];
  ColFlagLine = "008L";

} else if (col_f_DUO == DuoColorLib[9].name) {//
  papercolor3 = [237, 253, 220];
  ColFlagLine = "009L";

} else if (col_f_DUO == DuoColorLib[10].name) {//
  papercolor3 =  [236, 190, 92];
  ColFlagLine = "010L";

} else if (col_f_DUO == DuoColorLib[11].name) {//WHITE
  papercolor3 = [255, 255, 255];
  ColFlagLine = "011L";

} else if (col_f_DUO == DuoColorLib[12].name) {//GREY
  papercolor3 = [240, 240, 240];
  ColFlagLine = "012L";

} else if (col_f_DUO == DuoColorLib[13].name) {//BLACK
  papercolor3 = [0, 0, 0];
  ColFlagLine = "013L";
  duoFeature = "Ink";

}



Colors.papercolor = papercolor;
Colors.papercolor2 = papercolor2;
Colors.papercolor3 = papercolor3;
Colors.papergrey = greyscale(Colors.papercolor);




//////////////////////////////////////////////////////////////CONTRAST/////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////CLOUDS/////////////////////////////////////////////////////////////////////////////////////
//let cloudVars = { seed: rand(-1000, 1000), mult1: rand(2, 18), mult2: rand(5, 12), horizon: cams[camIndx].horizon,shadowStrength:6 } 
//cld_f = cloudLib[0].name;
if (cld_f == cloudLib[0].name) {
  cloudVars.mult1 = rand(2, 10);
  cloudVars.mult2 = rand(5, 9);
  cloudVars.ground = 1-rand(0.0, 0.10);
  
  Colors.mults.ground = 1 - rand(0.02, 0.10);

  Colors.mults.shadow = Colors.mults.ground * 1 / 2;
  cloudVars.lineWeightMult = rand(.5, 1);
  
  cloudVars.clear = 2;
  cloudVars.night = 2;
  
} else if (cld_f == cloudLib[1].name) {
  cloudVars.mult1 = rand(10, 14);
  cloudVars.mult2 = rand(9, 11);
  cloudVars.ground = 1 - rand(0.2, 0.4);

  Colors.mults.ground = 1 - rand(0.1, 0.2);

  Colors.mults.shadow = Colors.mults.ground * .95;
  cloudVars.lineWeightMult = rand(.8, 1.2);
  
  cloudVars.clear = 2;
  cloudVars.night = 2;

} else if (cld_f == cloudLib[2].name) {
  cloudVars.mult1 = rand(14, 18);
  cloudVars.mult2 = rand(11, 13);
  cloudVars.ground = 1 - rand(0.2, 0.4);

  Colors.mults.ground = 1 - rand(0.15, 0.3);

  Colors.mults.shadow = Colors.mults.ground * rand(.7, .3);
  cloudVars.lineWeightMult = rand(1.2, 1.5);
  
  cloudVars.clear = 2;
  cloudVars.night = 2;

} else if (cld_f == cloudLib[3].name) {
  cloudVars.mult1 = rand(2, 10);
  cloudVars.mult2 = rand(5, 9);
  cloudVars.ground = 1 - rand(0.0, 0.10);

  Colors.mults.ground = 1 - rand(0.02, 0.10);

  Colors.mults.shadow = Colors.mults.ground * 1 / 2;
  cloudVars.lineWeightMult = rand(.5, 1);
  
  cloudVars.clear = 0;
  cloudVars.night = 2;

}else if (cld_f == cloudLib[4].name) {
  cloudVars.mult1 = rand(10, 14);
  cloudVars.mult2 = rand(9, 11);
  cloudVars.ground = 1 - rand(0.1, 0.2);

  Colors.mults.ground = 1 - rand(0.75, 0.83);

  Colors.mults.shadow = Colors.mults.ground;
  cloudVars.lineWeightMult = rand(.8, 1.2);

  cloudVars.clear = 2;
  cloudVars.night = rand(.9, .987);

  cams[3].OrthGround = true;
  cams[5].OrthGround = true;
  cams[6].OrthGround = true;

  sunlock = true;

}
//////////////////////////////////////////////////////////////////////////////////////PLOTS


/*
{ name: 'circle', chance: 0, amount: 1, min: 0, max: 0 },
{ name: 'disk', chance: 0, amount: 1, min: 0, max: 0 },
{ name: 'axialSym', chance: 0, amount: 0, min: 0, max: 0 },
{ name: 'ring', chance: 0, amount: 1, min: 0, max: 0 },
{ name: 'grid', chance: 0, amount: 0, min: 0, max: 0 },
{ name: 'row', chance: 0, amount: 0, min: 0, max: 0 },
{ name: 'axis', chance: 0, amount: 1, min: 0, max: 0 },
*/



//pltC_f = plotCountLib[0].name;
//plt1_f = plot01Lib[7].name;


/////////////////////////////////////////////////////////////////// 1
if (plt1_f == plot01Lib[0].name) {
  plotController.string[0] = 'circle';
  plotController.indx[0] = 0;
} else if (plt1_f == plot01Lib[1].name) {
  plotController.string[0] = 'disk';
  plotController.indx[0] = 1;
} else if (plt1_f == plot01Lib[2].name) {
  plotController.string[0] = 'axialSym';
  plotController.indx[0] = 2;
} else if (plt1_f == plot01Lib[3].name) {
  plotController.string[0] = 'radialSym';
  plotController.indx[0] = 3;
} else if (plt1_f == plot01Lib[4].name) {
  plotController.string[0] = 'ring';
  plotController.indx[0] = 4;
} else if (plt1_f == plot01Lib[5].name) {
  plotController.string[0] = 'grid';
  plotController.indx[0] = 5;
} else if (plt1_f == plot01Lib[6].name) {
  plotController.string[0] = 'row';
  plotController.indx[0] = 6;
} else if (plt1_f == plot01Lib[7].name) {
  plotController.string[0] = 'axis';
  plotController.indx[0] = 7;
}

/////////////////////////////////////////////////////////////////// 2
if (plt2_f == plot01Lib[0].name) {
  plotController.string[1] = 'circle';
  plotController.indx[1] = 0;
} else if (plt2_f == plot01Lib[1].name) {
  plotController.string[1] = 'disk';
  plotController.indx[1] = 1;
} else if (plt2_f == plot01Lib[2].name) {
  plotController.string[1] = 'axialSym';
  plotController.indx[1] = 2;
} else if (plt2_f == plot01Lib[3].name) {
  plotController.string[1] = 'radialSym';
  plotController.indx[1] = 3;
} else if (plt2_f == plot01Lib[4].name) {
  plotController.string[1] = 'ring';
  plotController.indx[1] = 4;
} else if (plt2_f == plot01Lib[5].name) {
  plotController.string[1] = 'grid';
  plotController.indx[1] = 5;
} else if (plt2_f == plot01Lib[6].name) {
  plotController.string[1] = 'row';
  plotController.indx[1] = 6;
} else if (plt2_f == plot01Lib[7].name) {
  plotController.string[1] = 'axis';
  plotController.indx[1] = 7;
}


/////////////////////////////////////////////////////////////////// 3
if (plt3_f == plot03Lib[0].name) {
  plotController.string[2] = 'circle';
  plotController.indx[2] = 0;
} else if (plt3_f == plot01Lib[1].name) {
  plotController.string[2] = 'disk';
  plotController.indx[2] = 1;
} else if (plt3_f == plot01Lib[2].name) {
  plotController.string[2] = 'axialSym';
  plotController.indx[2] = 2;
} else if (plt3_f == plot01Lib[3].name) {
  plotController.string[2] = 'radialSym';
  plotController.indx[2] = 3;
} else if (plt3_f == plot01Lib[4].name) {
  plotController.string[2] = 'ring';
  plotController.indx[2] = 4;
} else if (plt3_f == plot01Lib[5].name) {
  plotController.string[2] = 'grid';
  plotController.indx[2] = 5;
} else if (plt3_f == plot01Lib[6].name) {
  plotController.string[2] = 'row';
  plotController.indx[2] = 6;
} else if (plt3_f == plot01Lib[7].name) {
  plotController.string[2] = 'axis';
  plotController.indx[2] = 7;
}


/////////////////////////////////////////////////////////////////// 4
if (plt4_f == plot04Lib[0].name) {
  plotController.string[3] = 'circle';
  plotController.indx[3] = 0;
} else if (plt4_f == plot01Lib[1].name) {
  plotController.string[3] = 'disk';
  plotController.indx[3] = 1;
} else if (plt4_f == plot01Lib[2].name) {
  plotController.string[3] = 'axialSym';
  plotController.indx[3] = 2;
} else if (plt4_f == plot01Lib[3].name) {
  plotController.string[3] = 'radialSym';
  plotController.indx[3] = 3;
} else if (plt4_f == plot01Lib[4].name) {
  plotController.string[3] = 'ring';
  plotController.indx[3] = 4;
} else if (plt4_f == plot01Lib[5].name) {
  plotController.string[3] = 'grid';
  plotController.indx[3] = 5;
} else if (plt4_f == plot01Lib[6].name) {
  plotController.string[3] = 'row';
  plotController.indx[3] = 6;
} else if (plt4_f == plot01Lib[7].name) {
  plotController.string[3] = 'axis';
  plotController.indx[3] = 7;
}

/////////////////////////////////////////////////////////////////// Count
if (pltC_f == plotCountLib[0].name) {
  plotController.num = 1;
  plotController.string = [plotController.string[0]];
  plotController.indx = [plotController.indx[0]];

  plotController.string.push("none");
  plotController.string.push("none");
  plotController.string.push("none");

  plotController.indx[1] = 8;
  plotController.indx[2] = 8;
  plotController.indx[3] = 8;


} else if (pltC_f == plotCountLib[1].name) {
  plotController.num = 2;
  plotController.string = [plotController.string[0], plotController.string[1]];
  plotController.indx = [plotController.indx[0], plotController.indx[1]];

  plotController.string.push("none");
  plotController.string.push("none");

  plotController.indx[2] = 8;
  plotController.indx[3] = 8;

} else if (pltC_f == plotCountLib[2].name) {
  plotController.num = 3;
  plotController.string = [plotController.string[0], plotController.string[1], plotController.string[2]];
  plotController.indx = [plotController.indx[0], plotController.indx[1], plotController.indx[2]];

  plotController.string.push("none");

  plotController.indx[3] = 8;

} else if (pltC_f == plotCountLib[3].name) {
  plotController.num = 4;

}


for (let i = 0; i < plotCountLib.length; i++) {

}

//console.log(plotController);




cloudVars.ground = Colors.papergrey[0] * Colors.mults.ground/255
//console.log(cloudVars.ground);
//////////////////////////////////shader uniforms
let mmm = cloudVars.lineWeightMult;
let rrr = shuffleArray([0, Math.PI / 2]);

//mmm = 1.5;


let myHatch = [
  [0, 0, 0, 0, 2.112627025969266, 0.796], //Main Controls
  [200, 200, 0, 200, 0, 0],//scale
  [rrr, rrr + Math.PI / 4, rrr + 2 * Math.PI / 4, rrr + 2 * Math.PI / 4, 3.59, 4.131252138359817],//ROTATION
  [0, 0, 0, 62.25, 3.62, 0], //wiggle1
  [20, 423.46, 502.63, 610.87, 390.81, 0], //wiggle2
  [3.53 * mmm, 1.92 * mmm, 3.62 * mmm, 3.35 * mmm, 2.06 * mmm, 0 * mmm],//LW
  [0.07 * mmm, 0.06 * mmm, 0.31 * mmm, 0.04 * mmm, 0.58 * mmm, 0 * mmm],//LW
  [20.61, 41.24, 32.59, 26.67, 3.6, -0.2150600911194367],//NOISE
  [0.57, 0.57, -0.23, 0.57, -0.03, 0.05881764676913497],//NOISE
  [1.812, 1.812, 0.922, 1.812, 0.492, 1.0806698094796767],//NOISE
];
//////////////////////////////////////////////////////////////GRASS STYLE//////////////////////////////////////////////////////////////
if (grs_f == grassStyleLib[0].name) { // BLANK
  VPC.Sindx = 0;
  drawGrass = false;

} else if (grs_f == grassStyleLib[1].name) {  //ETCH
  VPC.Sindx = 1;
  drawGrass = true;

} else if (grs_f == grassStyleLib[2].name) { // fill
  VPC.Sindx = 2;
  drawGrass = true;

}

VPC.currCam = camIndx;

//////////////////////////////////////////////////
if (gly_f == grassLayoutLib[0].name) {
  VPC.Lindx = 0;

} else if (gly_f == grassLayoutLib[1].name) {
  VPC.Lindx = 1;

} else if (gly_f == grassLayoutLib[2].name) {
  VPC.Lindx = 2;

} else if (gly_f == grassLayoutLib[3].name) {
  VPC.Lindx = 3;

}
//////////////////////////////////////////////////
if (grd_f == grassRenderLib[0].name) {
  VPC.Rindx = 0;

} else if (grd_f == grassRenderLib[1].name) {
  VPC.Rindx = 1;

} else if (grd_f == grassRenderLib[2].name) {
  VPC.Rindx = 2;
  
} else if (grd_f == grassRenderLib[3].name) {
  VPC.Rindx = 3;

} else if (grd_f == grassRenderLib[4].name) {
  VPC.Rindx = 4;

}


/*
for (let i=0; i<cams.length; i++){
  //if(cams[i].OrthGround == true ){
  //  let r = rand(0,1);
  //  if( r>=.2 ){
  //    cams[i].OrthGround = false 
  //  }
  //}
  //cams[i].OrthGround = true;

  if (i == 3 || i == 5 || i == 6 ){
    cams[i].OrthGround = true;
  }
  console.log(i)
  console.log(cams[i].OrthGround)


  
}*/

//PLan Zoom Factor
//cams[6].O[2] *= zoomFactor;




//////////////////////////////////////////////////////////////print//////////////////////////////////////////////////////////////
//credits
let cred = ["Benjamin Aranda", "Jesse Bassett", "Joaquin Bonifaz", "Chris Lasch"];
cred = shuffleEntireArrayRandom(cred);

console.log("Henge by ArandaLasch");
//console.log("Benjamin Aranda, Jesse Bassett, Joaquin Bonifaz, Chris Lasch");
console.log(cred[0] + ", " +cred[1] + ", " +cred[2] + ", " +cred[3] );


console.log("Hash: " + fxhash);

//features
console.log(" ");
console.log("Features: ");

//console.log("View:        " + cam_f);
//console.log("Perspective: " + perp_f);
//console.log("Axon: ");
//console.log("Plan:        " + plan_f);
//console.log("Elevation: ");
console.log("View:          " + view_f);
//onsole.log(viewOrg);
console.log("Paper Color:   " + col_f);
console.log("Line Color:    " + col_f_DUO);
console.log("Clouds:        " + cld_f);
console.log("Grass:         " + grs_f);
console.log("Landscape:     " + gly_f);
//console.log("Grass grad:    " + grd_f);

console.log("Plots Amount:  " + pltC_f);

//console.log("Plots 1:       " + plt1_f);
console.log("Plots 1:       " + plotTitles[plotController.indx[0]]);
//console.log(" ");

//console.log("Plots 2:       " + plt2_f);
console.log("Plots 2:       " + plotTitles[plotController.indx[1]]);
//console.log(" ");

//console.log("Plots 3:       " + plt3_f);
console.log("Plots 3:       " + plotTitles[plotController.indx[2]]);
//console.log(" ");

//console.log("Plots 4:       " + plt4_f);
console.log("Plots 4:       " + plotTitles[plotController.indx[3]]);
//console.log(" ");

console.log(" ");



window.$fxhashFeatures = {
  "View": printList[camIndx],
  "Color": duoFeature,
  "Paper Color": col_f,
  "Line Color": col_f_DUO,
  "Weather": cld_f,
  "Grass": grs_f,
  "Landscape": gly_f,

  "Layout Count": pltC_f,
  "Layout 1": plotTitles[plotController.indx[0]],
  "Layout 2": plotTitles[plotController.indx[1]],
  "Layout 3": plotTitles[plotController.indx[2]],
  "Layout 4": plotTitles[plotController.indx[3]],

}




//////////////////////////////////////////////////////////////SLIDERS//////////////////////////////////////////////////////////////
let SliderShape = {x:6,y:8,l:48};

let slider = [];
let init = [];
let lockbtn = [];
let lock = [];


let sliderBound =[];

for (let i=0; i<SliderShape.l; i++){
  let s = 0;
  let n = 0;
  slider.push(0);
  init.push(0);
  lockbtn.push(false);
  lock.push(false);

  sliderBound.push( {step:0.001, min:0,rMin:.25,rMax:.75,max:1} );
/*
  mins.push(.25);
  maxes.push(.75);
  mins2.push(0);
  maxes2.push(1);
  step.push(0.01)
*/

}
/*
sliderBound[0] = {step:1, min:0, rMin:0, rMax:plotCategoryNames.length-1,max:plotCategoryNames.length-1};//_plotCat
sliderBound[1] = {step:1, min:1000, rMin:1000, rMax:2000, max:4000};//_plotSize
//sliderBound[2] = {step:0.001, min:0.02, rMin:0.02, rMax:0.05, max:0.05};//_plotDen
sliderBound[2] = { step: 0.0001, min: 0.055, rMin: 0.063, rMax: 0.079, max: 0.085 };//_plotDen
sliderBound[3] = {step:0.001, min:0.25, rMin:.99, rMax:1.0, max:4.0};//_plotAmount
sliderBound[4] = { step: 1, min: 0, rMin: 0, rMax: stackCategoriesNames.length - 1, max: stackCategoriesNames.length - 1};//_StackCat
*/

sliderBound[0] = {step:1, min:1, rMin:1, rMax:4,max:4};//NUMBER OF PLOTS


if (sunlock = false){
  sliderBound[1] = { step: 0.001, min: Math.PI / 4, rMin: -Math.PI / 4, rMax: Math.PI / 4, max: Math.PI /4 };//sun azimuth
}else{
  sliderBound[1] = { step: 0.001, min: 0, rMin: 0.001, rMax: Math.PI*2, max: Math.PI*2 };//sun azimuth
}
sliderBound[2] = { step: 0.001, min: 0, rMin: 0 + 0.3, rMax: Math.PI/2-0.3, max: Math.PI/2 };//sun altitude


let sss = plotViewSize;
let SsS = Math.pow(plotViewSize,.5);sliderBound[0] = {step:1, min:1, rMin:1, rMax:4,max:4};//NUMBER OF PLOTS
for (let i=0; i<4; i++){
  sliderBound[16+8*i] = {step:1, min:0, rMin:0, rMax:plotCategoryNames.length-1,max:plotCategoryNames.length-1};                       //Plot Category
  sliderBound[17+8*i] = {step:1, min:1500*sss, rMin:1500*sss, rMax:8000*sss, max:15000*sss};                                                            //Plot size 
  //sliderBound[18+8*i] = {step: 0.0001, min: 0.055, rMin: 0.063, rMax: 0.079, max: 0.085 };                                             //Plot Density
  sliderBound[18+8*i] = {step: 0.0001, min: 0.065, rMin: 0.063, rMax: 0.081, max: 0.125 };                                             //Plot Density
  //sliderBound[19+8*i] = {step:0.001, min:0.25, rMin:0.9, rMax:2.0, max:5.0};                                                           //Plot Size Modifyer
  sliderBound[19+8*i] = {step:0.001, min:0.25*SsS, rMin:0.9*SsS, rMax:4.0*SsS, max:8.0*SsS}; 
  sliderBound[20+8*i] = {step: 1, min: 0, rMin: 0, rMax: stackCategoriesNames.length - 1, max: stackCategoriesNames.length - 1};       //Plots Stack Category
}



///console.log(sliderBound)
let RUN = false;

let sliderSum = 0;
let checkSumSlider = 0;

let SHADOWTEST1;
let SHADOWTEST2;


/////////////////////////////////////SHADERS/////////////////////////////////////////////
let cloudShader;
let shaderGraphics;
let duotoneShader;
let duotoneGraphics;

let E_flag = false;
let E_cloudShader;
let E_shaderGraphics;
let E_duotoneShader;
let E_duotoneGraphics;

//console.log(CanvasRenderingContext2D);
//CanvasRenderingContext2D.willReadFrequently = true;
let LoaderDiv;
let LoaderDivBK;

function preload() {

  //img = loadImage('assets/single_texture_01.jpg');
  img = loadImage('data:image/png;base64,' + base);



  grassLibrary.push(loadModel('./assets/grass012.obj'));     //Normal 1
  grassLibrary.push(loadModel('./assets/grass013.obj'));     //Normal 2
  grassLibrary.push(loadModel('./assets/grass014.obj'));     //Normal single
  grassLibrary.push(loadModel('./assets/grass015.obj'));     //Normal single 2
  grassLibrary.push(loadModel('./assets/grass200.obj'));     //tall1
  grassLibrary.push(loadModel('./assets/grass202.obj'));     //tall single
  grassLibrary.push(loadModel('./assets/grass201.obj'));     //tall single 2

  //grassLibrary.push(loadModel('assets/grass002.obj'));     //bush fill
  grassLibrary.push(loadModel('./assets/grass302.obj'));     //bush fill
  grassLibrary.push(loadModel('./assets/grass011.obj'));     //bush tall

  grassLibrary.push(loadModel('./assets/grass514.obj'));     //veritcal single
  grassLibrary.push(loadModel('./assets/grass515.obj'));     //veritcal single 2

  grassLibrary.push(loadModel('./assets/grass414.obj'));     //slant single
  grassLibrary.push(loadModel('./assets/grass415.obj'));     //slant single 2

  MDL.models = grassLibrary;
  

  cloudShader = loadShader('./assets/cloud.vert', './assets/cloud.frag');
  duotoneShader = loadShader('./assets/duo.vert', './assets/duo.frag');
  E_cloudShader = loadShader('./assets/cloud.vert', './assets/cloud.frag');
  E_duotoneShader = loadShader('./assets/duo.vert', './assets/duo.frag');
  //console.log("PreLOAD");
}




function toggleLoad(){
  document.getElementById("myLoader").style.display = "block";
}

function setup() {

  let DIM = Math.floor(Math.min(window.innerWidth, window.innerHeight));
  canvas = createCanvas(DIM, DIM, WEBGL);
  //console.log("canvas");
  //canvas.background(100, 100, 100);
  //canvas.parent("container2");
  pixelDensity(rezP);

  LoaderDiv = document.getElementById("myLoader");
  LoaderDivBK = document.getElementById("myloadbk");

  background(papercolor);
  //console.log(LoaderDiv)
  LoaderDiv.style.display = "block";
  LoaderDivBK.style.display = "block";
  let divCol = " ww";

  divCol = "rgb(" + Colors.papercolor[0] + "," + Colors.papercolor[1] + "," + Colors.papercolor[2] + ")";//rgbToHex(papercolor);
  LoaderDivBK.style.background = divCol;

  divCol = "rgb(" + Colors.papercolor3[0] + "," + Colors.papercolor3[1] + "," + Colors.papercolor3[2] + ")";
  LoaderDiv.style.borderTopColor = divCol;

  //LoaderDiv.addEventListener("keypress", toggleLoad());

  console.log("SETUP");

  // weird error not working
  //cloudShader = createShader(cvString, cfString);
  //duotoneShader = createShader(dvString, dfString);
  //E_cloudShader = createShader(cvString, cfString);
  //E_duotoneShader = createShader(dvString, dfString);







  //console.log(LoaderDiv);

  sun = new p5.Vector(1, -1, -1);

  /////////////////////////////////////////////////////////
  //SLIDERS//
  for (let i = 0; i < SliderShape.l; i++) {
    //init[i] =  rand(rMins[i],rMaxes[i])
    init[i] = rand(.25, .75);
  }
  let indx = 0;

  for (let i = 0; i < SliderShape.x; i++) {
    for (let j = 0; j < SliderShape.y; j++) {
      slider[indx] = createSlider( sliderBound[indx].min, sliderBound[indx].max, rand(sliderBound[indx].rMin,sliderBound[indx].rMax), sliderBound[indx].step );
      //slider[indx] = createSlider( mins2[indx], maxes2[indx], rand(mins[indx],maxes[indx]), step[indx] );
      //slider[indx] = createSlider(0, 1, rand(.25, .75), 0.01);
      init[indx] = slider[indx].value();

      slider[indx].addClass("mySliders");
      slider[indx].doubleClicked(createSDRfunction(indx));
//      slider[indx].parent("controls");

      let slider_Width = Math.round( layout.sldr_w / 6 - 10);

      let px = layout.p_mL + layout.p_m +  (slider_Width +10)*i
      let py = layout.p_mT + 2*layout.p_p + layout.can_h + (layout.sldr_h/ (SliderShape.y) )* (j) + 8 ;
      //slider[indx].position(px + 10, py + 6);
      //lockbtn[indx].position( px-3,  py+3  );
      //slider[indx].style('width', slider_Width);
      slider[indx].style('display', "none");

      checkSumSlider += slider[indx].value();

      indx++;
    }
  }

  //PLOT CONTROLLER 
  
  slider[0].value(plotController.num); 
  for (let i = 0; i < 4; i++) {
    slider[16 + 8 * i].value(plotController.indx[i]);
  }

  uiEraser();


  //canvas = createCanvas(layout.can_w, layout.can_h, WEBGL);





  roll();


  //////////////////////////////////////////////////////////////////////////////////UPDATE GEOMETRY
  //updategeometry();
  //////////////////////////////////////////////////////////////////////////////


  
  //console.log("ZOOM");
  //zoom = slider[0].value() * 1.14 * camRho / 5000;
  //console.log(zoom);
  ///////////////////////////////////////////zoom = plotMaxsize * 0.000564 * camRho / 5000;

  //console.log("ZOOM:");
  //console.log(zoom);
  //console.log("PLOT:");
  //console.log(plotMaxsize);
  
  /////////////////////////////////////////
   /*
  if (cams[camIndx].type == "ortho") {
    cam = ortho(-width * zoom, width * zoom, -height * zoom, height * zoom, 0.001, 100000);
  } */
  
  //sun = y
  //cloudShader    = createShader(basicVert2, basicFrag2);
  ///////////////////////////////////////////////////////////DUOTONE
  if (Colors.flags.isDuotone){
    /*
    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        let COL = img.get(i,j);
        let grey = COL[0]/255;
        COL[0] = lerp(papercolor3[0],255,grey);
        COL[1] = lerp(papercolor3[1],255,grey);
        COL[2] = lerp(papercolor3[2],255,grey);
        //COL[0] = (COL[0]+ 0)/2;
        //COL[1] = (COL[1]+ 90)/2;
        //COL[2] = (COL[2]+ 102)/2;
        
        //img.set(i, j, color(0, 90, 102));
        img.set(i, j, color(COL));
      }
    }
    img.updatePixels();
    */


    //duotoneGraphics = createGraphics(4800, 600, WEBGL);
    /* // MOBILE FIX
    if (mobile == false){
      duotoneGraphics = createGraphics(4096, 512, WEBGL);
    }else{
      duotoneGraphics = createGraphics(4096/8, 512/8, WEBGL);
    }
    */

    duotoneGraphics = createGraphics(4096 / 4, 512 / 4, WEBGL);
    
    duotoneGraphics.shader(duotoneShader);
    duotoneShader.setUniform('tex', img);
    //duotoneShader.setUniform('Col', [0.3, 0.4, 0.5]);
    duotoneShader.setUniform('Col', [papercolor3[0] / 255, papercolor3[1] / 255, papercolor3[2] / 255,]);

    duotoneGraphics.noStroke();
    duotoneGraphics.rect(0, 0, 100, 100);
    //duotoneGraphics.rect(0,0,width, height);

    



  }


  //////////////////////////////////////////////////////////////////////////////////SHADER
  UNIVAR.push(
    [
      myHatch[1].slice(0, 4), myHatch[1].slice(4),
      myHatch[2].slice(0, 4), myHatch[2].slice(4),
      myHatch[3].slice(0, 4), myHatch[3].slice(4),
      myHatch[4].slice(0, 4), myHatch[4].slice(4),
      myHatch[5].slice(0, 4), myHatch[5].slice(4),
      myHatch[6].slice(0, 4), myHatch[6].slice(4),
      myHatch[7].slice(0, 4), myHatch[7].slice(4),
      myHatch[8].slice(0, 4), myHatch[8].slice(4),
      myHatch[9].slice(0, 4), myHatch[9].slice(4),
      myHatch[0][4], myHatch[0].slice(0, 4), myHatch[0][5],
    ],
  );
  
  //shaderGraphics = createGraphics(4096, 4096, WEBGL);
  /* // MOBILE FIX
    if (mobile == false){
      shaderGraphics = createGraphics(2048, 2048, WEBGL)
    }else if (mobile == true){
      shaderGraphics = createGraphics(1200, 1200, WEBGL)
    }
    */
  shaderGraphics = createGraphics(4096/4, 4096/4, WEBGL);


  
  shaderGraphics.noStroke();
  //cloudShader.setUniform('u_resolution', [layout.can_w, layout.can_h]);
  shaderGraphics.shader(cloudShader);
//  console.log("shader");
  
  updateUniforms(cloudShader, 8);
  cloudShader.setUniform("cloudSeed", cloudVars.seed);
  cloudShader.setUniform("N1", cloudVars.mult1);
  cloudShader.setUniform("N2", cloudVars.mult2);
  cloudShader.setUniform("horizon", cams[camIndx].horizon);//cloudVars.horizon
  cloudShader.setUniform("ground", cloudVars.ground);
  cloudShader.setUniform("clear", cloudVars.clear);
  cloudShader.setUniform("night", cloudVars.night);
  //shaderGraphics.noFill();
  shaderGraphics.rect(0, 0, 100, 100);


  //console.log(duotoneGraphics.drawingContext);
  //console.log(shaderGraphics.drawingContext);


  /*
  let DIM = Math.floor(Math.min(window.innerWidth, window.innerHeight));
  canvas = createCanvas(DIM, DIM, WEBGL);
  //console.log("canvas");
  canvas.background(100,100,100);
  //canvas.parent("container2");
  pixelDensity(rezP);
  */
  



  //new cam

  //zoom = plotMaxsize * 0.000564*500 * camRho / 5000;
  //zoom = plotMaxsize * 0.0000564*1.9*1.5 * camRho ;
  //zoom = plotMaxsize * 0.00016074 * 0.6* camRho;
  zoom = plotMaxsize * 0.00016074 * zoomFactor * camRho;
  cams[4].height = plotMaxsize * .43 * zoomFactor;


  initCam(cams[camIndx].O);
  

  
  
  frameRate(5);

}

let savFlag = true;


function draw() {
    
  console.log(frameCount);
  //console.log("DRAW");
  //console.log(savFlag);


  if (frameCount == 1 || savFlag == false){
    background(papercolor);
    savFlag = true;
    //console.log(cams);
  }else{


    if (frameCount < 3){
      LoaderDiv.style.display = "block";
    }else{
      //LoaderDiv.style.display = "none";
    }
  background(papercolor);

  //background(255);
  if (cams[camIndx].OrthGround){
    background(Colors.ground);
  }else{
    background(papercolor);
  }
  
  //console.log("COLOR");
  
  //image(shaderGraphics, -100/2, -100/2, 100, 100);


  //console.log(slider[0].value());
  
  gimbalCam();
  push();//creates ground // do i need this anymore/
  rotateX(Math.PI/2);


  /*
  push()
  stroke(0)
  strokeWeight(1)
  fill(23,25,255)
  circle(0, 0, plotMaxsize*2);
  pop()
  */


  pop();

  //SKY
  if (cams[camIndx].BkFlag == true){ ////////////////DRAW BACKGROUND
    cloudShader.setUniform("horizon", cams[camIndx].horizon);
    shaderGraphics.rect(0, 0, 100, 100);
    //console.log(cams[camIndx].horizon);

    push();
    noStroke();

    //stroke(0);
    //strokeWeight(1);
    
    lightFalloff(0.003, 0.0003, 0);
    ambientLight(Colors.paper);
    texture(shaderGraphics);
    rotateY(Math.PI / 2);
    translate(0, -cams[camIndx].height, -40000 + (cams[camIndx].O[2] -10000) );
    //translate(0,-5900,0);
    let bkScale = 57800;
    translate(0, bkScale * (cams[camIndx].horizon - 0.5), 0); //wawa
    scale(bkScale);
    plane(1);
    noFill();
    pop();
  }/*else if (cams[camIndx].OrthGround == "true") {//////////////////////////////////////////DRAW TEXTURED GROUND PLANE
    push();
    lightFalloff(0.003, 0.0003, 0);
    //ambientLight(Colors.paper);
    translate(0, 0, 5000);
    rotateZ(Math.PI / 2);
    //stroke(10);
    //fill(255*cloudVars.ground);
    fill(Colors.ground);
    rotateY(Math.PI / 2);
    circle(0, 0, 10000000);//horrizon
    pop();
  }*/

  

  /*
  //UNIL
  push();//SUN ANGLE
  stroke("red");
  strokeWeight(3);
  stroke("yellow");
  line(0, 0, 0, sun.x * 5000, sun.y * 5000, sun.z * 5000);// vanishes after one frame???
  for (let i = 0; i < 20; i++) {
    point(sun.x * i / 20 * 5000, sun.y * i / 20 * 5000, sun.z * i / 20 * 5000);
  }
  pop();

  push();
  strokeWeight(1);
  for (let i = 0; i < 20; i++) {
    stroke("red");
    point(i / 20 * 5000, 0, 0);
    stroke("green");
    point(0, i / 20 * 5000, 0);
    stroke("blue");
    point(0, 0, i / 20 * 5000);
  }
  pop();
  */
  



  if (drawGrass == true) {
    //console.log("jb")
    //console.log(TTT)
    //console.log(TTT.ind[camIndx])
    //console.log(  Gflag[TTT.ind[camIndx]].models       )

    for (let i = 0; i < VPS[camIndx].length; i++) {
      for (let j = 0; j < VPS[camIndx][i].amount; j++) {
        push();
        translate(VPS[camIndx][i].x[j], 0, VPS[camIndx][i].y[j]);
        rotateY(VPS[camIndx][i].rotateList[j]);
        scale(VPS[camIndx][i].grassScaleList[j] * .7);
        VPS[camIndx][i].myStroke(j);
        VPS[camIndx][i].myStrokeWeight(j);
        VPS[camIndx][i].myFill(j);
        //model(MDL.models[  TTT.ind[camIndx][i]  ]); 
        model(MDL.models[Gflag[TTT.ind[camIndx]].models[i]]); 
        pop();
      }
    }

  }



  //texture stones
  if (Colors.flags.isDuotone) {
    duotoneGraphics.noStroke();
    duotoneGraphics.rect(0, 0, width, height);
    texture(duotoneGraphics);
  }else{
    texture(img);
  }
  noStroke();
  //texture(img);
  //noStroke();
  

  //stroke(0);
  //strokeWeight(4);
  let indxT = 0;
 

  indxT = 0;
  for (let i = 0; i < plotCollection.length; i++) {// V3
    for (let j = 0; j < plotCollection[i].stack.length; j++) {
      for (let k = 0; k < plotCollection[i].stack[j].stoneAmount; k++) {

        push();
        lightFalloff(0.003, 0.0003, 0);
        ambientLight(Colors.stone);
        //ambientLight(papercolor.levels[0]+10,papercolor.levels[1]+10,papercolor.levels[2]+10); // make stacks slightly brigter than Background
        smooth();
      
        strokeWeight(1 * rezP / 2);
        model(geom[indxT]);

 

        fill(Colors.shadow)
        



        model(geomS[indxT]);
        
        indxT++;
        pop();
      }
    }
    
    
  }
  
  /*
  for (let i = 0; i < goS_p.length; i++) {
  //for (let i = 0; i < 2; i++) {
    for (let j = 0; j < goS_p[i].length; j++) {
      stroke(50);
      strokeWeight(1);
      //point(goS_p[i]);
      //point(goS_p[i][j] );
      
    }
  }
  */

  
  //save("mySketch" + ".png");
  //noLoop();
  /*LOOP DEBUG
  console.log("loc A");
  console.log("  ");
  */
  
  
  if (isLooping){
    //console.log("Not looping");
    if (renderFlag){
      fxpreview();
      renderFlag = false;
    }
    //console.log("frameCount " + frameCount)
    /*
    //noLoop();
    if(frameCount % 3 == 0){
      noLoop();
    }
    */

  }else{
    //console.log("Looping");


    if (printNEXT) {

      save("Henge "+ printList[camIndx]);
      pixelDensity(2);

      //gimbalCam()
      initCam(cams[camIndx].O);


      //ortho(-v * zoom, v * zoom, -v * zoom, v * zoom, -10000, 10000);
      prtScn = false;
      printNEXT = false;
      
      isLooping = true;
      LoaderDiv.style.display = "none";
      //shad_Size = 1024;
      //bkrez = 4096;
      //drawTex = true;
      //console.log("printNEXT");
    }


    if (prtScn) {
      LoaderDiv.style.display = "block";
      let dp = 2048/DIM ;
      console.log(dp);
      console.log(DIM);
      pixelDensity(dp);

      //gimbalCam()
      initCam(cams[camIndx].O);

      //cloudShader.setUniform("rez", DIM);
      //pixelDensity(4);
      //ortho(-v * zoom, v * zoom, -v * zoom, v * zoom, -10000, 10000);
      printNEXT = true;
      LoaderDiv.style.display = "none";
      
      //shad_Size = 1024/2;
      //bkrez = 4096/2;
      //drawTex = true;
      //console.log("prtSCN");
    }







  }
  /*LOOP DEBUG
  console.log("isLooping: " + isLooping);
  console.log("prtScn:    " + prtScn);
  console.log("printNEXT: " + printNEXT);
  console.log("BULK:      " + BULK);
  console.log("  ");
  console.log("loc B");
  */
  if (frameCount >= 3) {
    LoaderDiv.style.display = "none";
    LoaderDivBK.style.display = "none";
    
  }
  if(frameCount >= 6){ // ui looping speed fix
    noLoop()
  }
  }
  
}//END DRAW




function roll(){//randomized on Mint / N Key press

  //clear previous values;
  plot = [];
  plotCollection = [];
  stackList = [];//random variables
  go = [];//stone mehses
  goem = [];
  geom.splice(0,geom.length);
  vegPlot =[];
  goS_p = [];
  goS = [];
  geomS = [];

  //papercolor
  //let rcolor = rList(3,-5,10);
  //papercolor = color(199+rcolor[0], 196+rcolor[1], 181+rcolor[2]);

  
  /*if (Colors.flags.isMultiColor == false){
    papercolor = color(papercolor);

    Colors.papergrey = greyscale(Colors.papercolor);// irrelivant lmao
    Colors.stone = flatTint(Colors.papercolor, Colors.mults.stone);
    Colors.paper = Colors.papercolor;
    Colors.ground = flatShade(Colors.papercolor, Colors.mults.ground);
    Colors.shadow = flatShade(Colors.papercolor, Colors.mults.shadow);
    Colors.skyfill = flatShade(Colors.papercolor, Colors.mults.skyfill);
    //console.log(Colors);
  }else */if (Colors.flags.isMultiColor == true){
    papercolor = color(papercolor);
    //papercolor2 = color(papercolor2);

    //console.log(papercolor2)
    //console.log(Colors.papercolor)

    Colors.papergrey = greyscale(Colors.papercolor);// irrelivant lmao
    Colors.stone = flatTint(papercolor2, Colors.mults.stone);
    Colors.paper = Colors.papercolor;
    Colors.ground = flatShade(Colors.papercolor, Colors.mults.ground);
    Colors.shadow = flatShade(papercolor2, Colors.mults.shadow);
    Colors.skyfill = flatShade(Colors.papercolor, Colors.mults.skyfill);
    //console.log(Colors);
  }else if (Colors.flags.isDuotone == true){
    papercolor = color(papercolor);
    //papercolor2 = color(papercolor2);

    //console.log(papercolor2)
    //console.log(Colors.papercolor)
    //console.log(papercolor3);
    Colors.mults.shadow = 1;

    Colors.papergrey = greyscale(Colors.papercolor);// irrelivant lmao
    Colors.stone = flatTint(Colors.papercolor, Colors.mults.stone);
    Colors.paper = Colors.papercolor;
    Colors.ground = flatShade(Colors.papercolor, Colors.mults.ground);
    Colors.shadow = flatShade(papercolor3, Colors.mults.shadow);
    Colors.skyfill = flatShade(Colors.papercolor, Colors.mults.skyfill);

  }else{
    papercolor = color(papercolor);

    Colors.papergrey = greyscale(Colors.papercolor);// irrelivant lmao
    Colors.stone = flatTint(Colors.papercolor, Colors.mults.stone);
    Colors.paper = Colors.papercolor;
    Colors.ground = flatShade(Colors.papercolor, Colors.mults.ground);
    Colors.shadow = flatShade(Colors.papercolor, Colors.mults.shadow);
    Colors.skyfill = flatShade(Colors.papercolor, Colors.mults.skyfill);
    //console.log(Colors);

  }
  //console.log(Colors.papercolor)
  //console.log(papercolor3);

  


  //sun
  sun.x =  Math.sin(slider[2].value()) * Math.cos(slider[1].value());
  sun.y = -Math.cos(slider[2].value());
  sun.z = -Math.sin(slider[2].value()) * Math.sin(slider[1].value());
  sun.normalize();

  //CAM

  //test WAAW 
  /*
  if (cams[camIndx].type == "ortho") {
    cam = ortho(-width * zoom, width * zoom, -height * zoom, height * zoom, 0.001, 100000);
  } 
  */
 

  //make plot
  //plot = makePlot();
  //console.log(plot);

  /*
  slider[0].value(1);
  
  slider[16 + 8 * 0].value(1);
  slider[17 + 8 * 0].value(3000);
  //slider[18 + 8 * 0].value(.1);
  //slider[19 + 8 * 0].value(.9);
  slider[20 + 8 * 0].value(5);
  */

  ////////////////////////////////////////////// increase density for plots that are too small
  /*
  if (slider[0].value() == 1){
    //if (plotCategoryNames[slider[16 + 8 * 0].value()].name == "ring" ){
    //
    //
    //  slider[0].value(2)
    //}else{
    //
    //}
    slider[0].value(2)
  }
  */





  let tempCounter = 0;
  for (let i = 0; i < slider[0].value(); i++) {

    let temp_plotSize = slider[17 + 8 * i].value();//circle radius
    let temp_plotDen = slider[18 + 8 * i].value() / 10000; //density with respect to area
    let temp_plotAmount = Math.floor(Math.PI * temp_plotSize * temp_plotSize * temp_plotDen);
    tempCounter += temp_plotAmount;
  }

 
  if (tempCounter <= 14){
    console.log("PLOT COUNT SMALL")
    tempCounter = 0;
    for (let i = 0; i < slider[0].value(); i++) {

      let t1 = slider[17 + 8 * i].value();//circle radius
      slider[17 + 8 * i].value(t1*1.5);

      let t2 = slider[18 + 8 * i].value(); //density with respect to area
      slider[18 + 8 * i].value(t2*1.5);

      let t3 = Math.floor(Math.PI * t1 * t1 * t2);
      tempCounter += t3;
    }
  }

  if (tempCounter <= 14) {
    console.log("PLOT COUNT SMALL 2 ")
    tempCounter = 0;
    for (let i = 0; i < slider[0].value(); i++) {

      let t1 = slider[17 + 8 * i].value();//circle radius
      slider[17 + 8 * i].value(t1 * 1.5);

      let t2 = slider[18 + 8 * i].value(); //density with respect to area
      slider[18 + 8 * i].value(t2 * 1.5);

      let t3 = Math.floor(Math.PI * t1 * t1 * t2);
      tempCounter += t3;
    }
  }


  
  let sizeCheck = 1.0;
  let totalNumStack = 0; 
  while ( totalNumStack <= 40 ){
    totalNumStack = 0; 
    for (let i = 0; i < slider[0].value(); i++) {
    //for (let i = 0; i < 1; i++) {
    
      
      //console.log(stackCategoriesNames[6].name);
      //console.log(slider[20+8*i].value() );
      let temp_plotCat    = plotCategoryNames[                                     slider[16+8*i].value()   ].name;
      //let temp_plotCat    = shuffleArray(["ring","axis"]);
      let temp_plotSize   =                                                        slider[17+8*i].value() * sizeCheck;//circle radius
      let temp_plotDen    =                                                        slider[18+8*i].value()  /10000* sizeCheck; //density with respect to area
      let temp_plotAmount = Math.floor(Math.PI*temp_plotSize * temp_plotSize * temp_plotDen)* sizeCheck;
      let temp_scaling    =                                                        slider[19+8*i].value();
      let temp_stackCat   = stackCategoriesNames[                                  slider[20+8*i].value()   ].name;
      //let temp_stackCat   = "simple";
      let temp_plot       = new Plotattributes(temp_plotCat,temp_plotSize,temp_plotDen,temp_plotAmount,temp_scaling,temp_stackCat  );
      let temp_plot2      = makePlot(temp_plot);
      
      
      totalNumStack += temp_plot2.amount; 
      //console.log(totalNumStack);
      

      plotCollection[i] = temp_plot2;
    }
    
    //console.log("sizeCheck " + sizeCheck);
    if (sizeCheck > 1.0){
      //console.log("Size error... rebuilding");
      //console.log("Scalar: " + sizeCheck);
      console.log("Rebuilding..." +  sizeCheck);
    }
    sizeCheck += 0.08;
  // console.log("collection");
    //console.log(plotCollection)
  }

  plotMaxsize = 0;
  plotMaxHeight = 0;

  for (let i = 0; i < plotCollection.length; i++) {
    if (plotCollection[i].size > plotMaxsize){
      plotMaxsize = plotCollection[i].size;
    }
  }

  //resize plan perspective zoom
  cams[6].O[2] *= plotMaxsize/7600;


 Gindx = 0;
 
  grass = [];
  Gflag[Gindx].gd = [];
  Gflag[Gindx].gs = [];
  gdl = [
    rList(1,0.005,0.015)[0]*20*0.6,//grass012
    rList(1,0.005,0.015)[0]*20*0.6,,//grass013//grass density for each type of mesh 0.02<d<0.05
    rList(1,0.01,0.035)[0]*20*0.6,,//grass014
    rList(1,0.01,0.1)[0]*20*0.6,,//grass015
    rList(1,0.00,0.001)[0]*20*0.6,,//grass200
    rList(1,0.00,0.001)[0]*20*0.6,,//grass202
    rList(1,0.005,0.007)[0]*20*0.6,,//grass201
    rList(1,0.005,0.007)[0]*30*0.6,,//grass002
    rList(1,0.005,0.007)[0]*20*0.6,,//grass011
  ];


  MDL.density = [
    rList(1, 0.005, 0.015)[0] * 20*0.6,,//grass012
    rList(1, 0.005, 0.015)[0] * 20*0.6,,//grass013//grass density for each type of mesh 0.02<d<0.05
    rList(1, 0.01, 0.035)[0] * 20*0.6,,//grass014
    rList(1, 0.01, 0.1)[0] * 30*0.6,,//grass015
    rList(1, 0.00, 0.001)[0] * 30*0.6,,//grass200
    rList(1, 0.00, 0.001)[0] * 20*0.6,,//grass202
    rList(1, 0.005, 0.007)[0] * 20*0.6,,//grass201
    rList(1, 0.005, 0.007)[0] * 30*0.6,,//grass302         //grass002
    rList(1, 0.005, 0.007)[0] * 20*0.6,,//grass011
    rList(1, 0.01, 0.035)[0] * 20*0.6,,//grass514
    rList(1, 0.01, 0.1)[0] * 20*0.6,,//grass515
    rList(1, 0.01, 0.035)[0] * 20*0.6,,//grass414
    rList(1, 0.01, 0.1)[0] * 20*0.6,,//grass415
  ];

  MDL.modelScale = [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1];
  


  /*
  console.log("GRASS DEBUG:");
  console.log("MDL:");
  console.log(MDL);
  console.log ("VPC:");
  console.log(VPC);
  */

  //Gindx controller??
  if (VPC.Sindx == 1 || VPC.Sindx == 0){ // ETCH
    let aaa = shuffleArray([3,4]);  // this shit be annoying
    //aaa = 0;
    TTT.ind.push(aaa);//p1
    TTT.ind.push(aaa);//p2
    TTT.ind.push(aaa);//p3 - landscape
    TTT.ind.push(0);//plan
    TTT.ind.push(0);//elevation ?????????????????????????
    TTT.ind.push(0);//axon
    TTT.ind.push(0);//plan perspectiv
  } else if (VPC.Sindx == 2) {// FILL
    let aaa = shuffleArray([1, 2]);
    TTT.ind.push(aaa);//p1
    TTT.ind.push(aaa);//p2
    TTT.ind.push(aaa);//p3 - landscape
    TTT.ind.push(aaa);//plan
    TTT.ind.push(aaa);//elevation
    TTT.ind.push(aaa);//axon
    TTT.ind.push(aaa);//plan perspectiv
  }

  
  
  
  //style + layout 
  for (let i = 0; i < 7; i++) {// cam view
    let tSTY = [];
    let tLAY = [];
    //console.log(TTT.ind[i]);
    for (let j = 0; j < Gflag[TTT.ind[i]].models.length; j++) {// cam view
      

      if (VPC.Lindx == 0){
        tLAY.push( "circle" );
      } else if (VPC.Lindx == 1) {
        tLAY.push("disk");
      } else if (VPC.Lindx == 2) {
        tLAY.push("large");
      } else if (VPC.Lindx == 3) {
        tLAY.push(shuffleArray( ["circle", "disk", "large",])   );
      }

      if (VPC.Sindx == 1) {
        if (VPC.Rindx == 0) {
          tSTY.push("plain");
        } else if (VPC.Rindx == 1) {
          tSTY.push("grad1");
        } else if (VPC.Rindx == 2) {
          tSTY.push("grad1");
        } else if (VPC.Rindx == 3) {
          tSTY.push("grad2");
        }else if (VPC.Rindx == 4) {
          //tSTY.push("fade");
          tSTY.push("plain");
        }
      } else {
        tSTY.push("fill1");
      }

     
      

    }
    TTT.sty.push(tSTY);
    TTT.lay.push(tLAY);
  }

  //console.log("TTT");
  //console.log(TTT);


  // VPS init

  for (let i = 0; i < 7; i++) {// cam view
    let temp = [];
    for (let j = 0; j < Gflag[  TTT.ind[i]  ].models.length; j++) {// cam view

      //Gflag[  TTT[i]  ].models[j]
                     //constructor(1, _layout              , _size                      , _density          , _scaleMult        , _style.) {
      temp.push(new Vegattributes(1, TTT.lay[i][j], plotMaxsize - 200 + 300 * i, MDL.density[TTT.ind[i]], MDL.modelScale[TTT.ind[i]], TTT.sty[i][j])  );
      //temp.push(  new Vegattributes(1, Gflag[Gindx].camType, plotMaxsize - 200 + 300 * i, Gflag[Gindx].gd[i], Gflag[Gindx].gs[i], Gflag[Gindx].style[i])  );


    }
    VPS.push(temp);
  }
  //console.log("VPS")
  //console.log(VPS);

  
  for (let i = 0; i < Gflag[Gindx].models.length; i++) {
    grass.push( grassLibrary[ Gflag[Gindx].models[i] ] );
    Gflag[Gindx].gd.push(gdl[Gflag[Gindx].models[i]]);
    Gflag[Gindx].gs.push(gs[Gflag[Gindx].models[i]]);
  }

  //console.log(Gflag[Gindx].gs);

  //constructor(1, _layout, _size, _density, _scaleMult, _style.) {



  //let vegDen = []; // density somehow? IDK
  //vegDen.push(rList(1,0.005,0.015)[0]);//grass013//grass density for each type of mesh 0.02<d<0.05
  //vegDen.push(rList(1,0.01,0.035)[0]);//grass014
  //vegDen.push(rList(1,0.01,0.1)[0]);//grass015
  //vegDen.push(rList(1,0.00,0.001)[0]);//grass202
  //vegDen.push(rList(1,0.005,0.007)[0]);//grass201


  
  //console.log(vegDen );
  //console.log( gd);

  //let grassPlottype = 'circle';
  //
  //if (camIndx == 0 || camIndx == 1 || camIndx == 2){
  //    grassPlottype = 'frustrum';
  //}

  /* JESSE GRASS FIX
  if (camIndx < 2) {
    Gflag[Gindx].camType = "frustrum";
  }else{
    Gflag[Gindx].camType = "circle";
  }*/


  //Gflag[Gindx].camType = "disk";

  //Gflag[Gindx].style = "fill1";

  let temptest = ["circle,disk"];

  for (let i = 0; i < grass.length; i++){
    vegPlot.push(new Vegattributes(1, Gflag[Gindx].camType, plotMaxsize - 200 + 300 * i, Gflag[Gindx].gd[i], Gflag[Gindx].gs[i], Gflag[Gindx].style[i]));
    //vegPlot.push(new Vegattributes(1, temptest[i], plotMaxsize - 200 + 300 * i, Gflag[Gindx].gd[i], Gflag[Gindx].gs[i], Gflag[Gindx].style[i]));
  }

  //vegPlot.push(new Vegattributes(1, "circle", plotMaxsize - 200 + 300 * 0, Gflag[Gindx].gd[0], Gflag[Gindx].gs[0], Gflag[Gindx].style[0]));
  //vegPlot.push(new Vegattributes(1, "disk", plotMaxsize - 200 + 300 * 1, Gflag[Gindx].gd[1], Gflag[Gindx].gs[1], Gflag[Gindx].style[1]));
  
  //console.log("egg");
  //console.log(vegPlot);

  //make stack
  //stackList = makeStack();
  //plot.stack = makeStack();

  updategeometry();
}//end roll

function updategeometry(){// we have to seperate randomized variables from maing p5 geometry

  //papercolor = color(papercolor);

  //VORONOI STUFF
  voronoiRndSites(30, 50);
  voronoiJitterStepMax(20);//Maximum distance between jitters
  voronoiJitterStepMin(5);  //Minimum distance between jitters
  voronoiJitterFactor(3);//Scales each jitter
  voronoiJitterBorder(true);//Jitter edges of diagram
  voronoi(750, 750, true);//Compute voronoi diagram with size 500 by 500,With a prepared jitter structure (true)

  //CREATE MESHs
  vCells = voronoiGetCells();

  /*
  for (let i = 0; i < plot.stack.length; i++){
    for (let j = 0; j < plot.stack[i].stoneAmount; j++){
      console.log(vCells[plot.stack[i].VoronoiIndex[j]]);
      go.push(new Stone3d(0, vCells[plot.stack[i].VoronoiIndex[j]], plot.stack[i].stoneHeight[j], plot.stack[i].stoneLength[j], plot.stack[i].stoneWidth[j], plot.stack[i].rotation[j]));
    }
  }
  
  console.log(go);
  go = [];
  */

  
  let htemp = 0;
  for (let i = 0; i < plotCollection.length; i++) {
    //console.log(i)
    for (let j = 0; j < plotCollection[i].stack.length; j++) {
      //console.log(plotCollection[i].stack[j]);
      htemp = 0;
      for (let k = 0; k < plotCollection[i].stack[j].stoneAmount; k++) {
        //point(plotCollection[i].x[j],0, plotCollection[i].y[j] );
        //console.log(vCells[plotCollection[i].stack[j].VoronoiIndex[k]]);
        go.push(new Stone3d(0, vCells[plotCollection[i].stack[j].VoronoiIndex[k]], plotCollection[i].stack[j].stoneHeight[k], plotCollection[i].stack[j].stoneLength[k], plotCollection[i].stack[j].stoneWidth[k], plotCollection[i].stack[j].rotation[k], plotCollection[i].x[j], plotCollection[i].y[j], htemp));
        goS.push(new Stone3d(0, vCells[plotCollection[i].stack[j].VoronoiIndex[k]], plotCollection[i].stack[j].stoneHeight[k], plotCollection[i].stack[j].stoneLength[k], plotCollection[i].stack[j].stoneWidth[k], plotCollection[i].stack[j].rotation[k], plotCollection[i].x[j], plotCollection[i].y[j], htemp));
        htemp = htemp + plotCollection[i].stack[j].stoneHeight[k];
      }
    }
  }
  
  //console.log(go[0]);
  //console.log(goS[0].faces.length);
  //console.log(go[1]);
  //console.log(go[2]);
 


  for (let i = 0; i < goS.length; i++) {
    // SHADOW POINTS goS_p.push(projectShadows(go[i].verts, sun, createVector(0, 0, 0), createVector(0, 1, 0),));
    
    for (let j = 0; j < goS[i].faces.length; j++) {
    goS[i].faces[j].facePts = projectShadows(goS[i].faces[j].facePts , sun, createVector(0, 0, 0), createVector(0, 1, 0),);
    }
  }
  //console.log(go);
  
  for(let i = 0; i < go.length; i++){
    geom.push(buildModel(go,i));
    geomS.push(buildModel(goS, i));
    
  }

//console.log(goS_p[0].verts);
//console.log(goS_p[1]);
//console.log(goS_p[2]);

}


function makePlot(_arg){
  let _plot = _arg;
  //console.log(_plot)
 
  if (_plot.category == 'circle'){
    _plot.amount = Math.floor(_plot.density / 25 * Math.PI * ((_plot.size) * (_plot.size) ));
    _plot.amount *= .8;
    for (let i = 0; i < _plot.amount; i++){
      let tempT = rList(1,0,Math.PI*2);
      let tempR = rListPow(1,0,_plot.size,.5);
      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));
    }
  }else if (_plot.category == 'disk'){
    let diskMin = _plot.size * rand(.6,.8);
    _plot.amount = Math.floor(_plot.density/25* Math.PI*((_plot.size) * (_plot.size) - (diskMin)*(diskMin) ));
    for (let i = 0; i < _plot.amount; i++){
      let tempT = rList(1,0,Math.PI*2)[0];
      let tempR = rListPow(1,diskMin,_plot.size,.5)[0];
       _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));
    }
  }else if (_plot.category == 'axialSym'){
    _plot.amount = Math.floor(_plot.density / 25 * Math.PI * ((_plot.size) * (_plot.size)));
    _plot.amount *= .8;
    _plot.amount = _plot.amount/2;
    for (let i = 0; i < _plot.amount; i++){
      let tempT = rList(1,0,Math.PI);
      let tempR = rListWeight(1,0,_plot.size,.5);
      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));
      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(-tempR*Math.sin(tempT));
    }
  }else if (_plot.category == 'radialSym'){
    _plot.amount = Math.floor(_plot.density / 25 * Math.PI * ((_plot.size) * (_plot.size)));
    _plot.amount *= .8;
    _plot.amount = _plot.amount / 8;
    for (let i = 0; i < _plot.amount; i++){
      let tempT = rList(1,0,Math.PI/4);
      let tempT2 = rList(1,Math.PI/4,Math.PI/2);
      let tempR = rListWeight(1,0,_plot.size,.5);
      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));

      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(-tempR*Math.sin(tempT));

      _plot.x.push(-tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));

      _plot.x.push(-tempR*Math.cos(tempT));
      _plot.y.push(-tempR*Math.sin(tempT));

      _plot.x.push(tempR*Math.cos(tempT2));
      _plot.y.push(tempR*Math.sin(tempT2));

      _plot.x.push(tempR*Math.cos(tempT2));
      _plot.y.push(-tempR*Math.sin(tempT2));

      _plot.x.push(-tempR*Math.cos(tempT2));
      _plot.y.push(tempR*Math.sin(tempT2));

      _plot.x.push(-tempR*Math.cos(tempT2));
      _plot.y.push(-tempR*Math.sin(tempT2));
    }
  }else if (_plot.category == 'ring'){
    let radius = _plot.size;// - 250;
    let cir = Math.floor(Math.PI *2 * radius);//this is circumference???
    _plot.amount = Math.floor(  (_plot.density/0.0000071)*(_plot.density/0.0000071) * (cir / 500)/_plot.scaling  ) ;
    for (let i = 0; i < _plot.amount; i++){
      let tempT = (Math.PI*2/_plot.amount) * i
      let tempR = radius; // Distribution ISSUE ????
      _plot.x.push(tempR*Math.cos(tempT));
      _plot.y.push(tempR*Math.sin(tempT));
    }
  }else if (_plot.category == 'grid'){
    let gridScale = rInt(300,800);
    let gridAmount = _plot.size/gridScale;
    for (let i = 0; i < gridAmount; i++){
      for (let j = 0; j < gridAmount; j++){ //ISSUE sometimes its an oval???
        //let d = dist(i*gridScale, j*gridScale, 0, 0);
        let d = Math.sqrt( (i*gridScale*2)*(i*gridScale*2) + (j*gridScale)*(j*gridScale) );
        if(d <= _plot.size){
          _plot.x.push(i*gridScale);
          _plot.y.push(j*gridScale);

          _plot.x.push(-i*gridScale);
          _plot.y.push(j*gridScale);

          _plot.x.push(i*gridScale);
          _plot.y.push(-j*gridScale);

          _plot.x.push(-i*gridScale);
          _plot.y.push(-j*gridScale);
        }
      }
    }
  }else if (_plot.category == 'row'){
    let gridScale = rInt(300,400);
    let gridAmount = _plot.size/gridScale;
    for (let i = 0; i < gridAmount/2; i++){
      for (let j = 0; j < gridAmount; j++){ //ISSUE sometimes its an oval???
        //let d = dist(i*gridScale*2, j*gridScale, 0, 0);
        let d = Math.sqrt( (i*gridScale*2)*(i*gridScale*2) + (j*gridScale)*(j*gridScale) );
        if(d <= _plot.size){
          _plot.x.push(i*gridScale*2);
          _plot.y.push(j*gridScale);

          _plot.x.push(-i*gridScale*2);
          _plot.y.push(j*gridScale);

          _plot.x.push(i*gridScale*2);
          _plot.y.push(-j*gridScale);

          _plot.x.push(-i*gridScale*2);
          _plot.y.push(-j*gridScale);
        }
      }
    }
  }else if (_plot.category == 'axis'){
    let axisNum = Math.ceil(rand(2,8));
    //let axisNum = 3;
    //let gridScale = Math.floor( rInt(200,300)* _plot.scaling * (_plot.density/0.0000071)*(_plot.density/0.0000071)   );
    //let gridAmount = Math.floor(_plot.size/gridScale) ;

    let gridScale = Math.floor( rInt(200,300)* _plot.scaling * (     ( 	0.0000144-_plot.density)   /0.0000071)*(( 	0.0000144-_plot.density) /0.0000071)) ;
    let gridAmount = Math.floor(_plot.size/gridScale)  ;

    if (gridAmount <= 4){
      gridAmount = 6;
      console.log("SMALL AXIS ERROR");
    }

    for (let i = 0; i < axisNum; i++){
      for (let j = 2; j < gridAmount; j++){
        let tempT = Math.PI*2*i/(axisNum);
        let tempR = gridScale*j;
        _plot.x.push(tempR*Math.cos(tempT));
        _plot.y.push(tempR*Math.sin(tempT));
      }
    }
    _plot.x.push(0);
    _plot.y.push(0);
    _plot.scaling*= .7;
  }else if (_plot.category == 'packedRings'){

  }else if (_plot.category == 'packedCurve'){

  }else{
    _plot.x.push(0);
    _plot.y.push(0);
  }
  _plot.amount = _plot.x.length;

  if(_plot.stackCategory == "regular"){
    _plot.scaling *= 1;
  }else if(_plot.stackCategory == "tall"){
    _plot.scaling *= 1;
  }else if(_plot.stackCategory == "short"){
    _plot.scaling *= 1.55;
  }else if(_plot.stackCategory == "big"){
    _plot.scaling *= 1;
  }else if(_plot.stackCategory == "long"){
    _plot.scaling *= 1.1;
  }else if(_plot.stackCategory == "thin"){
    _plot.scaling *= 1;
  }else if(_plot.stackCategory == "simple"){
    _plot.scaling *= 1.25;
  }


  _plot.stack = makeStack(_plot);
  return(_plot);
}


function makeStack(_plot){
    _stackList =[];
  //let stackCat = shuffle(stackCategories)[0];
  //let stackCat = stackCategoriesNames[slider[4].value()].name
  let stackCat = _plot.stackCategory;
  //console.log(stackCat);
  let vList = new Array();
  //console.log('Plot: ' + plot.category + ', Stack: ' + stackCat);
  for(let i = 0; i < 30 ; i++){//voronoi list to use, sort by area later
    vList.push(i);
  }

  for (let i = 0; i < _plot.amount ; i++) {
    _stackList.push(new Stackattributes());
    _stackList[i].name = i;
    _stackList[i].category = stackCat;
    //_stackList[i].category = 'regular'
  }
 
  S = _plot.scaling;
  //let stackCategories = ['regular','tall','short','big','long','thin','sorted','centered','bowl','cone'];
  for (let i = 0; i < _stackList.length ; i++) {
    if (_stackList[i].category == 'regular'){
      _stackList[i].stoneAmount = rInt(2,7);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,100*S,250*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,100*S,250*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,50*S,150*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'tall'){
      _stackList[i].stoneAmount = rInt(1,6);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,100*S,200*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,100*S,200*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,100*S,500*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'short'){
      _stackList[i].stoneAmount = rInt(3,6);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,200*S,500*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,200*S,500*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,75*S,100*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'big'){
      _stackList[i].stoneAmount = rInt(1,2);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,150*S,300*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,150*S,300*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,200*S,600*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'long'){
      _stackList[i].stoneAmount = rInt(4,6);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,50*S,150*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,100*S,500*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,50*S,150*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'thin'){
      /*
      _stackList[i].stoneAmount = rInt(9,15);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,150*S,200*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,150*S,200*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,35*S,70*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
      */
      _stackList[i].stoneAmount = rInt(1, 1);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount, 140 * S, 150 * S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount, 150 * S, 150 * S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount, 360 * S, 400 * S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount, 0, Math.PI / 2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));





    } else if (_stackList[i].category == 'simple'){
      _stackList[i].stoneAmount = rInt(1,1);
      _stackList[i].stoneLength = rList(_stackList[i].stoneAmount,140*S,150*S);
      _stackList[i].stoneWidth = rList(_stackList[i].stoneAmount,150*S,150*S);
      _stackList[i].stoneHeight = rList(_stackList[i].stoneAmount,360*S,400*S);
      _stackList[i].rotation = rList(_stackList[i].stoneAmount,0,Math.PI/2);
      _stackList[i].VoronoiIndex = shuffleEntireArray(vList.slice(0));
    } else if (_stackList[i].category == 'sorted'){

    } else if (_stackList[i].category == 'center'){

    }else{

    }
    //console.log(vList);

    //console.log(_stackList[i].VoronoiIndex); 
  }



  for (let i = 0; i < _stackList.length ; i++) {//overflow Maybe fix later?
    _stackList[i].x = _plot.x[i];
    _stackList[i].y = _plot.y[i];
  }

  return (_stackList)
}





function buildModel(_go,i) { 
  return new p5.Geometry(1, 1,
    function createGeometry() {
      let indx = 0;
    //for(let i = 0; i < _go.length ; i++){ // for loop is outside this function now.
      for (let j = 0; j < _go[i].faces.length; j++) { //faces
        let faceIndx = [];
        for (let k = 0; k < _go[i].faces[j].facePts.length; k++) { //face pts
          this.vertices.push(_go[i].faces[j].facePts[k]);
            faceIndx.push(indx);
            indx += 1;
          } //end face pts
        this.faces.push([faceIndx[0], faceIndx[1], faceIndx[2]]);
        n = createVector(_go[i].faces[j].normal.x, _go[i].faces[j].normal.y, _go[i].faces[j].normal.z);
        n.normalize();
        this.vertexNormals.push(n, n, n);
        let imgSeg = 1 / 8;
        let dotProd = sun.dot(n);
        let ang = sun.angleBetween(n);
        let imgNum = map(dotProd, -1, 1, 0, 7);
        imgNum = floor(imgNum);

        let b = _go[i].faces.length/4;
        let c = _go[i].vPts.length;

        if(j < b){//bottom stuff
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j].facePts[0].x / 8, _go[i].vPts[j].facePts[0].y]);
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j].facePts[1].x / 8, _go[i].vPts[j].facePts[1].y]);
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j].facePts[2].x / 8, _go[i].vPts[j].facePts[2].y]);
        }else if (j >= b && j < 2*b){//top stuff
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j - c].facePts[0].x / 8, _go[i].vPts[j-c].facePts[0].y]);
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j - c].facePts[1].x / 8, _go[i].vPts[j-c].facePts[1].y]);
          this.uvs.push([imgSeg * imgNum + _go[i].vPts[j - c].facePts[2].x / 8, _go[i].vPts[j-c].facePts[2].y]);
        }else if (j >= 2*b && j < 3*b){//side1
          this.uvs.push([imgSeg * imgNum, 1]);
          this.uvs.push([imgSeg * imgNum, 0]);
          this.uvs.push([imgSeg * (imgNum + 1), 1]);
        }else if (j >= 3*b && j < 4*b){//side2
          this.uvs.push([imgSeg * (imgNum + 1), 1]);
          this.uvs.push([imgSeg * imgNum, 0]);
          this.uvs.push([imgSeg * (imgNum + 1), 0]);
        }else{//generic
          this.uvs.push([imgSeg * imgNum, 0]);
          this.uvs.push([imgSeg * imgNum, 1]);
          this.uvs.push([(imgSeg * imgNum) + (0.866 * imgSeg), 0.5]);
        }
        //console.log(this.uvs);
        this.gid = 'my-stack-geometry-'+ rand() + '-' + i.toString();
      }
    //}
    }
  );
}
let TEST = false;
let highRun = false;

function highResShot(_Num){
  if (TEST){
    if (highRun == false){
    console.log("shot");
    console.log("texture:");
    
    console.log(duotoneGraphics.drawingContext);
    duotoneGraphics.save("Duo orginal.png");
      E_duotoneGraphics = createGraphics(4096 / _Num, 512 / _Num, WEBGL);

    E_duotoneGraphics.shader(E_duotoneShader);
    E_duotoneShader.setUniform('tex', img);
    E_duotoneShader.setUniform('Col', [papercolor3[0] / 255, papercolor3[1] / 255, papercolor3[2] / 255,]);
    E_duotoneGraphics.noStroke();
    E_duotoneGraphics.rect(0, 0, 100, 100);

    E_duotoneGraphics.save("Duo modify.png");
    duotoneGraphics.reset();
    duotoneGraphics = E_duotoneGraphics;
    duotoneGraphics.noStroke();
    duotoneGraphics.rect(0, 0, 100, 100);

    duotoneGraphics.save("Duo new.png");

    console.log(E_duotoneGraphics.drawingContext);
    //E_duotoneGraphics.remove();

    console.log(duotoneGraphics.drawingContext);
    console.log(E_duotoneGraphics.drawingContext);

    ////////////////////////////////////////////////////////////////////////////
    console.log("Background:");

    console.log(shaderGraphics.drawingContext);
    shaderGraphics.save("cloud orginal.png");
      E_shaderGraphics = createGraphics(4096 / _Num, 4096 / _Num, WEBGL);

    E_shaderGraphics.shader(E_cloudShader);
    updateUniforms(E_cloudShader, 8);
    E_cloudShader.setUniform("cloudSeed", cloudVars.seed);
    E_cloudShader.setUniform("N1", cloudVars.mult1);
    E_cloudShader.setUniform("N2", cloudVars.mult2);
    E_cloudShader.setUniform("horizon", cams[camIndx].horizon);//cloudVars.horizon
    E_cloudShader.setUniform("ground", cloudVars.ground);
    E_cloudShader.setUniform("clear", cloudVars.clear);
    E_cloudShader.setUniform("night", cloudVars.night);
    E_shaderGraphics.noStroke();
    E_shaderGraphics.rect(0, 0, 100, 100);
   
    E_shaderGraphics.save("cloud modify.png");
    shaderGraphics.reset();
    shaderGraphics = E_shaderGraphics;
    shaderGraphics.noStroke();
    shaderGraphics.rect(0, 0, 100, 100);

    shaderGraphics.save("cloud new.png");

    console.log(E_shaderGraphics.drawingContext);
    //E_duotoneGraphics.remove();

    console.log(shaderGraphics.drawingContext);
    console.log(E_shaderGraphics.drawingContext);

    highRun = false;
    console.log(highRun);
  }


  }

  
}

let TOGGLE_FLAG = false;



function keyPressed() {
  if ((key == 'i') || (key == 'i')) {
    loop()
    //save("mySketch" + sketchNum + '_' + plot.category + '_' + stackList[0].category + ".png");
    //save("mySketch" + ".png");
    //sketchNum ++;
    console.log("Printing!")
    isLooping = false;
    savFlag = false;
    loop();
    //highResShot(2);
    
    LoaderDiv.style.display = "block";
    




    //initCam(cams[camIndx].O);

    //redraw();
    

    prtScn = true;
  }
  if ((key == 'n') || (key == 'N')) {
    //generate();
    //roll();
    //updategeometry(); // moved to end of roll()RUN
    
    console.log("n");
  }
  if ((key == 'm') || (key == 'M') ){
    //TEST = !TEST;
    //console.log(TEST);
    //console.log("M");
    //rLocks();
    //console.log('l');
  }
  if ((key == 'u') || (key == 'U') ){
    //unLock();
    //console.log('u');
    //img.save();
  }
  if ((key == 'b') || (key == 'B')) {
    //TOGGLE_FLAG = !TOGGLE_FLAG;
    //console.log(TOGGLE_FLAG);
    
  }

  // Show Debug stuff
  if ((key == 'x') || (key == 'X')) {
      //showGrid = !showGrid;
      //console.log('switching debug mode');
  }

  if ((key == 'g') || (key == 'G')) {
    //LoaderDiv.style.display = "block";
    //console.log(LoaderDiv);

    //document.getElementById("myLoader").style.display = "block";
    //console.log(document.getElementById("myLoader"));
  }

  if ((key == 'f') || (key == 'F')) {
    //LoaderDiv.style.display = "none";
    //console.log(LoaderDiv);

    //document.getElementById("myLoader").style.display = "none";
    //console.log(document.getElementById("myLoader"));
    
  }

  if ((key == 'q') || (key == 'Q')) {
    //shaderGraphics.save();
  }


  //go through view list
  if (keyCode === LEFT_ARROW) {
    //console.log(LoaderDiv);
    document.getElementById("myLoader").style.display = "block";
    //console.log(LoaderDiv);
    lArrow();
    initCam(cams[camIndx].O);
    console.log(printList[camIndx]);
    //redraw();
    loop();
    //document.getElementById("myLoader").style.display = "none";
    //console.log(LoaderDiv);
  }
  if (keyCode === RIGHT_ARROW) {
    document.getElementById("myLoader").style.display = "block";
    rArrow();
    initCam(cams[camIndx].O);
    console.log(printList[camIndx]);
    //redraw();
    loop();
    //document.getElementById("myLoader").style.display = "none";
  }
}


function touchStarted() {
//function mousePressed() {
  
  if (mouseX > DIM/2 && mouseX <= DIM ) {
    document.getElementById("myLoader").style.display = "block";
    rArrow();

    //console.log('touch R');

    initCam(cams[camIndx].O);
    console.log(printList[camIndx]);
    //redraw();
    loop();
    
  } else if ( mouseX >= 0 && mouseX <= DIM/2 ) {
    document.getElementById("myLoader").style.display = "block";
    lArrow();

    //console.log('touch L');

    initCam(cams[camIndx].O);
    console.log(printList[camIndx]);
    //redraw();
    loop();
    
  }
  //console.log(mouseX);

}

//averages array
function avgArray(arr) {
  let sum = 0;
  for (const item of arr) {
    sum += item;
  }
  return sum / arr.length;
}

//Sums an array
function Sum() {
  let sum = 0;
  for (const item of arguments) {
    sum += item;
  }
  return sum;
}

//find center of list of verts
function polyCenter(list){ // list of points  [[x0,y0],[x1,y1],[x2,y2],...,[xn,yn]]
	let xAr = [];
	let yAr = [];
	let xAV = [];
	let yAV = [];
	centerPoint = [];

	for (var i = 0; i < list.length; i++){
		xAr.push(list[i][0]);
		yAr.push(list[i][1]);
	}
	xAV = avgArray(xAr);
	yAV = avgArray(yAr);
	centerPoint.push(xAV);
	centerPoint.push(yAV);

	return centerPoint;// [x0,y0]
}

//find area of list of verts UNFINISHED
function polyArea(list){ // list of points  [[x0,y0],[x1,y1],[x2,y2],...,[xn,yn]]
	let xAr = [];
	let yAr = [];
	let xAV = [];
	let yAV = [];
	let shapeArea = 0;

	for (var i = 0; i < list.length; i++){
		yAr = list[i][0]*list[i+1][1]-list[i+1][0]*list[i][1];
	}
	xAV = avgArray(xAr);
	yAV = avgArray(yAr);
	centerPoint.push(xAV);
	centerPoint.push(yAV);

	return shapeArea;
}

///////////////////RANDOM FUNCTIONS ///////////////////////////////////////////
function rList(length=1, low=0, high=1) {
  let myList = [];
  for(let i=0; i<length; i++){
    myList.push( (high-low)*( rand() )+low ) ;
  }
  return myList
}

function rListInt(length=1, low=0, high=1) {
  let myList = [];
  for(let i=0; i<length; i++){
    myList.push( Math.round(  (high-low)*( rand() )+low )  ) ;
  }
  return myList
}

function rInt( low = 0, high = 10) {
  let r = Math.round( (high-low)*( rand() )+low ) ;
  return r
}


function rand( low = 0, high = 1) {
  //let r =  (high-low)*( Math.random() )+low  ;
  let r =  (high-low)*( fxrand() )+low  ;
  return r
}

function rListWeight(length, min, max, power) {
  let myList = [];
  let temp = 0;
  let inverse = 1/power;
  for(let i=0; i<length; i++){
    temp = min/max;
    temp = Math.pow(temp ,1/inverse);
    temp = rand(temp,1);
    temp = Math.pow(temp,power)
    temp = temp * max
    myList.push(temp);
  }
  return myList
}

function rListPow(length=1, low=0, high=1,pow=1) {
  let myList = [];
  for(let i=0; i<length; i++){
    myList.push( (high-low)*(    Math.pow(rand(),pow)   )+low ) ;
  }
  return myList
}

function shuffleArray(items)
{
  return items[Math.floor(rand()*items.length)];
}

function shuffleEntireArray(_array) {
  /*

  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(rand() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  */

  for (var i = _array.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var temp = _array[i];
    _array[i] = _array[j];
    _array[j] = temp;
  }
  return (_array);


}

function shuffleEntireArrayRandom(_array) {
  let currentIndex = _array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [_array[currentIndex], _array[randomIndex]] = [
      _array[randomIndex], _array[currentIndex]];
  }

  return _array;
}


/////////////////////////////////////////////////////////////////

function windowResized() {
  console.log("reSized");
  //let DIM_ = min(windowWidth,windowHeight);
  //if (DIM_<DEFAULT_SIZE){
  //  DIM = DIM_;
  //}
  //let DIM = min(windowWidth,windowHeight);
  //resizeCanvas(DIM, DIM);

  //resizeCanvas(Math.ceil(layout.can_w), Math.ceil(layout.can_h));
  DIM = Math.floor(Math.min(window.innerWidth,window.innerHeight) );
  resizeCanvas(DIM, DIM);
  pixelDensity(rezP);
  

  initCam(cams[camIndx].O);
  redraw();

}

function hideSliders(){


}

function showSliders(){

}

function partialSum(arr){
  return arr.reduce((acc, el, i, arr) => {
    const slice = arr.slice(0, i + 1)
    const sum = slice.reduce((a, b) => a + b, 0)
    return [...acc, sum]
  }, [])
}


function createSDRfunction( indx )  {
  return function() {  sdr( indx );  }
}
function sdr(indx){
  lock[indx] = !lock[indx];
  console.log(indx);
  console.log(slider[indx].value())
  if (lock[indx] == true ){
    slider[indx].style('opacity', .4);
  }else{
    slider[indx].style('opacity', 1);
  }
}

function uiEraser(){
  //slider[0].position(20,10);
  //slider[0].position(20,10);
  //slider[4].style("display","none");

  for (let i = 4; i < 16; i++) {
    slider[i].style("display", "none");
  }

  for (let i = 0; i < 4; i++) {
    slider[23 + 8 * i].style("display", "none");
    slider[22 + 8 * i].style("display", "none");
    slider[21 + 8 * i].style("display", "none");
  }


}

function generate(){
  for (let i=0; i<SliderShape.l; i++){
    if(lock[i] != true){
      //slider[i].value( rand( rMins[i][j],rMaxes[i][j])  );
      slider[i].value( rand( 0,1 ) );
    }
  }
}

function rLocks(){
  for (let i=0; i<SliderShape.l; i++){
    let roll = rand();
    let rollp = rand(.2,.9);

    if (roll<rollp){
      lock[i] = true;
      slider[i].style('opacity', .4);
    }else{
      lock[i] = false;
      slider[i].style('opacity', 1);
    }
  }
}

function unLock(){
  for (let i=0; i<SliderShape.l; i++){
    lock[i] = false;
    slider[i].style('opacity', 1);
  }
}


function projectShadows(_pts, dir, planePT, planeNML){// projects list of p5 vector to a plane along a direction
  let myList = [];

  //plane
  let A = planeNML.x;
  let B = planeNML.y;
  let C = planeNML.z;
  let D = A*planePT.x + B*planePT.y + C*planePT.z;

  //line
  let a = dir.x;
  let b = dir.y;
  let c = dir.z;

  for (let i=0; i<_pts.length; i++){

    let x = _pts[i].x;
    let y = _pts[i].y;
    let z = _pts[i].z;

    let t = ( D - A*x - B*y - C*z )/( A*a + B*b + C*c );
    let pt = createVector( x+t*a, y+t*b, z+t*c );
    myList.push(pt);
  }

  return myList;
}


//SHADERZ///////////////////////////////////////////////////////////////////////////////////////////////////


function updateUniforms(_shader,i){
  for (let j=0; j<UNI.length; j++){
    _shader.setUniform(UNI[j],UNIVAR[i][j]);
  }
}


function lerp(a, b, x) { return a + (b - a) * x }

function greyscale(col){ // convert RGB to greyscale
  let srgb;
  let R  = col[0] /255;
  let G = col[1] / 255;
  let B = col[2] / 255;
  let linear = 0.2126 * R + 0.7152 * G + 0.0722 * B ;

  if (linear > 0.0031308 ){
    srgb = 1.055 * Math.pow(linear, (1 / 2.4)) - 0.055;
  }else{
    srgb = 12.92 * linear;
  }

  srgb*=255;

  return [srgb, srgb, srgb, ];
}

function flatShade(col, n){
  return [
    col[0] * n,
    col[1] * n,
    col[2] * n
  ];
}

function flatTint(col,n) {
  return [
    (255 - col[0]) * (1 - n) + col[0] ,
    (255 - col[1]) * (1 - n) + col[1],
    (255 - col[2]) * (1 - n) + col[2],
    ];
}
function clamp(t,min,max){
  return Math.min(Math.max(t, min), max);
}



function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}



let cvString = "  attribute vec3 aPosition; attribute vec2 aTexCoord; varying vec2 vTexCoord;   void main() {  \n  vTexCoord = aTexCoord;      vec4 positionVec4 = vec4(aPosition, 1.0);    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;    gl_Position = positionVec4; \n } ";  
let cfString = "// Author:Jesse Bassett\n  #ifdef GL_ES   \n precision mediump float; \n #endif  \n     varying vec2 vTexCoord;    uniform vec4 LF1;  uniform vec2 LF2;      uniform vec4 LR1;  uniform vec2 LR2;    uniform vec4 dA1;  uniform vec2 dA2;    uniform vec4 df1;  uniform vec2 df2;    uniform vec4 wb1;  uniform vec2 wb2;    uniform vec4 bb1;  uniform vec2 bb2;    uniform vec4 Nf1;  uniform vec2 Nf2;    uniform vec4 Nn1;  uniform vec2 Nn2;    uniform vec4 Nx1;  uniform vec2 Nx2;      uniform float indx;    uniform vec4 Ld;    uniform float cBlend;    uniform float cloudSeed;     uniform float N1;     uniform float N2;     uniform float horizon;    uniform float ground;    uniform float clear;    uniform float night;      uniform vec2 rez;    const int Len = 5;    int sel = 2;    float time = -0.04;  //float N1 = 4.368;  //float N2 = 7.784;  const int N_Octaves = 8;     \n #define BlendScreen(base, blend)(1.0 - ((1.0 - base) * (1.0 - blend))) \n   vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }    float snoise(vec2 v) {    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);        vec2 i = floor(v + dot(v, C.yy));        vec2 x0 = v - i + dot(i, C.xx);        vec2 i1 = vec2(0.0);    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);        vec2 x1 = x0.xy + C.xx - i1;        vec2 x2 = x0.xy + C.zz;    i = mod289(i);        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);    m = m * m;    m = m * m;        vec3 x = 2.0 * fract(p * C.www) - 1.0;        vec3 h = abs(x) - 0.5;        vec3 ox = floor(x + 0.5);        vec3 a0 = x - ox;    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);        vec3 g = vec3(0.0);    g.x = a0.x * x0.x + h.x * x0.y;    g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);    return 130.0 * dot(m, g);  }    vec2 rotateUV(vec2 uv, float rotation)  { return vec2(cos(rotation) * (uv.x - 0.5) + sin(rotation) * (uv.y - 0.5) + 0.5, cos(rotation) * (uv.y - 0.5) - sin(rotation) * (uv.x - 0.5) + 0.5); }    float SmoothStep(float edge0, float edge1, float x){        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);    return t;  }            float random(in vec2 st) {    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);  }    float random3D(in vec3 st) {    return fract(sin(dot(st, vec3(12.9898, 78.233, 50.169))) * 43758.5453123);  }        float noise(in vec2 st) {    vec2 i = floor(st);    vec2 f = fract(st);      // Four corners in 2D of a tile    vec2 noff = vec2(0.00, 0.0);//noise offfset // doesnt do that actually    float a = random(i + vec2(0.0 + noff.x, 0.0 + noff.y));    float b = random(i + vec2(1.0 + noff.x, 0.0 + noff.y));    float c = random(i + vec2(0.0 + noff.x, 1.0 + noff.y));    float d = random(i + vec2(1.0 + noff.x, 1.0 + noff.y));      vec2 u = f * f * (3.0 - 2.0 * f);      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;  }  \n  #define OCTAVES 2 \n float fbm(in vec2 st) {    // Initial values    float value = 0.0;    float amplitude = .5;    float frequency = 0.;    //    // Loop of octaves    for (int i = 0; i < OCTAVES; i++) {      value += amplitude * noise(st);      st *= 2.;      amplitude *= .5;    }    return value;  }        float mod289(float x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }  vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }  vec4 perm(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }    float noise3d(vec3 p){    vec3 a = floor(p);    vec3 d = p - a;    d = d * d * (3.0 - 2.0 * d);      vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);    vec4 k1 = perm(b.xyxy);    vec4 k2 = perm(k1.xyxy + b.zzww);      vec4 c = k2 + a.zzzz;    vec4 k3 = perm(c);    vec4 k4 = perm(c + 1.0);      vec4 o1 = fract(k3 * (1.0 / 41.0));    vec4 o2 = fract(k4 * (1.0 / 41.0));      vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);      return o4.y * d.y + o4.x * (1.0 - d.y);  }      float fbm3d(vec3 x) {  float v = 0.0;  float a = 0.5;  vec3 shift = vec3(100);    for (int i = 0; i < N_Octaves; ++i) {      v += a * noise3d(x);      x = x * 2.0 + shift;      a *= 0.2;    }    return v;  }        float sdOrientedBox( in vec2 p, in vec2 a, in vec2 b, float th)  {      float l = length(b - a);      vec2  d = (b - a) / l;      vec2  q = p - (a + b) * 0.5;    q = mat2(d.x, -d.y, d.y, d.x) * q;    q = abs(q) - vec2(l * 0.5, th);    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);  }    vec4 shadeCloud(vec2 v1, vec2 v2, float th, float r){      vec4 R = vec4(0.0);      vec2 V = v2 - v1;      V = V.yx;    V.x = -V.x * sign(r);    V.y = V.y * sign(r);      r = abs(r);    V = normalize(V) * (th - th * r);      R.xy = v1 + V;    R.yw = v2 + V;      R.x = v1.x + V.x;    R.y = v1.y + V.y;    R.z = v2.x + V.x;    R.w = v2.y + V.y;      return R;    }    vec3 col3d( in vec3 P, in vec2 st, in vec2 v1, in vec2 v2, in float th, in float r, in float r2) {    vec3 x = P * N1;    //float v = fbm3d(x);    	float v = 0.0;  	float a = 0.5;  	vec3 shift = vec3(100);    for (int i = 0; i < N_Octaves; ++i) {      v += a * noise3d(x);      x = x * 2.0 + shift;      a *= 0.5;    }    //return v;    //v*=N2;    //P+= vec3(v)*N2*(sin(time));          st += vec2(v) * N2 * (sin(time));  	    vec4 SH;    vec3 c;    float mask1 = sdOrientedBox(st, v1, v2, th);    mask1 = 0.0 + sign(mask1) * 1.;      SH = shadeCloud(v1, v2, th, abs(r));    float mask2 = sdOrientedBox(st, SH.xy, SH.zw, th * r);    mask2 = 0.0 + sign(mask2) * 1.;      SH = shadeCloud(v1, v2, th, -r2);    float mask3 = sdOrientedBox(st, SH.xy, SH.zw, th * r2);    mask3 = 0.0 + sign(mask3) * 1.;      c = vec3(mask1, mask2, mask3);        return c;  }    void main() {      vec2 st = vTexCoord;        vec3 param = vec3(0.);      vec3 C;          vec2 v1 = vec2(-0.290, 0.590);      vec2 v2 = vec2(1.880, 0.710);      float th = 0.292;      float r = 0.362;      float r2 = 0.234;      //horizon ajust scaleing.    v1.y = -2. * ((horizon + 0.1) * v1.y - (horizon + 0.1) - v1.y + 0.5);    v2.y = -2. * ((horizon + 0.1) * v2.y - (horizon + 0.1) - v2.y + 0.5);    //th = th*(1.5-((0.5-horizon)/.5));    C = col3d(vec3(st.x, st.y, cloudSeed), st, v1, v2, th, r, r2);      //OLD SKY + CLOUDS    //if (st.y >= clear){    //  C = vec3(1.0);    //  //C.x = 1.0;    //  //C.y = 1.0;    //  //C.z = 1.0;    //}                float mask1 = C.x;      float mask2 = C.y;      float mask3 = C.z;        vec2 st_1 = st;      vec2 st_2 = st;      vec2 st_3 = st;      vec2 st_4 = st;      vec2 st_5 = st;      vec2 st_6 = st;      vec3 color = vec3(0.0);    st_1 = rotateUV(st, LR1.x);    st_1.x += cos(st_1.y * dA1.x) / df1.x;    st_1.y += sin(st_1.x * dA1.x) / df1.x;      float pos_1 = st_1.x * LF1.x;      float y = 0.;      float x = pos_1;    y = sin((x + Ld.z) * Ld.y);    y += sin((x + Ld.z) * Ld.y * 2.1 + Ld.w) * 4.5;    y += sin((x + Ld.z) * Ld.y * 1.72 + Ld.w * 1.121) * 4.0;    y += sin((x + Ld.z) * Ld.y * 2.221 + Ld.w * 0.437) * 5.0;    y += sin((x + Ld.z) * Ld.y * 3.1122 + Ld.w * 4.269) * 2.5;    y *= Ld.x * 0.06;    pos_1 = pos_1 + y;    float colL_1 = wb1.x * bb1.x * ((cos(pos_1 * 2. * 3.14) + 1.) / 2.) - bb1.x + 1.;    float colLC_1 = clamp(colL_1, 0.090, 1.0);      vec2 posN_1 = st * Nf1.x;      float colN_1 = (snoise(posN_1) * .5 + .5);      float colNC_1 = smoothstep(Nn1.x, Nx1.x, colN_1);    st_2 = rotateUV(st_2, LR1.y);    st_2.x += cos(st_2.y * dA1.y) / df1.y;    st_2.y += sin(st_2.x * dA1.y) / df1.y;    float pos_2 = st_2.x * LF1.y;    float colL_2 = wb1.y * bb1.y * ((cos(pos_2 * 2. * 3.14) + 1.) / 2.) - bb1.y + 1.;    float colLC_2 = clamp(colL_2, 0.090, 1.0);    vec2 posN_2 = st_2 * Nf1.y;    float colN_2 = (snoise(posN_2) * .5 + .5);      float colNC_2 = smoothstep(Nn1.y, Nx1.y, colN_2);    st_3 = rotateUV(st_3, LR1.z);    st_3.x += cos(st_3.y * dA1.z) / df1.z;    st_3.y += sin(st_3.x * dA1.z) / df1.z;    float pos_3 = st_3.x * LF1.z;    float colL_3 = wb1.z * bb1.z * ((cos(pos_3 * 2. * 3.14) + 1.) / 2.) - bb1.z + 1.;    float colLC_3 = clamp(colL_3, 0.090, 1.0);    vec2 posN_3 = st_3 * Nf1.z;    float colN_3 = (snoise(posN_3) * .5 + .5);    float colNC_3 = smoothstep(Nn1.z, Nx1.z, colN_3);    st_4 = rotateUV(st_4, LR1.w);    st_4.x += cos(st_4.y * dA1.w) / df1.w;    st_4.y += sin(st_4.x * dA1.w) / df1.w;    float pos_4 = st_4.x * LF1.w;    float colL_4 = wb1.w * bb1.w * ((cos(pos_4 * 2. * 3.14) + 1.) / 2.) - bb1.w + 1.;    float colLC_4 = clamp(colL_4, 0.090, 1.0);    vec2 posN_4 = st_4 * Nf1.w;    float colN_4 = (snoise(posN_4) * .5 + .5);    float colNC_4 = smoothstep(Nn1.w, Nx1.w, colN_4);    st_5 = rotateUV(st_5, LR2.x);    st_5.x += cos(st_5.y * dA2.x) / df2.x;    st_5.y += sin(st_5.x * dA2.x) / df2.x;    float pos_5 = st_5.x * LF2.x;    float colL_5 = wb2.x * bb2.x * ((cos(pos_5 * 2. * 3.14) + 1.) / 2.) - bb2.x + 1.;    float colLC_5 = clamp(colL_5, 0.090, 1.0);    vec2 posN_5 = st_5 * Nf2.x;    float colN_5 = (snoise(posN_5) * .5 + .5);    float colNC_5 = smoothstep(Nn2.x, Nx2.x, colN_5);    vec2 posN_6 = st_6 * Nf2.y;    float colN_6 = (snoise(posN_6) * .5 + .5);    float colNC_6 = smoothstep(Nn2.y, Nx2.y, colN_6);    if (indx == 1.0) {      colNC_5 = colNC_5 + colNC_2;      colNC_4 = colNC_4 + colNC_3;      colNC_1 = 0.108 * (colNC_6 - 0.) + colNC_1;      colNC_2 = 0.292 * (colNC_6 - 0.) + colNC_2;      colNC_3 = -0.448 * (-colNC_6 + 0.024) + colNC_3;    } else if (indx == 2.0) {      colNC_5 = colNC_5 + colNC_2;      colNC_4 = 1.;      colNC_3 = 0.664 * colNC_6 + colNC_3;      colNC_2 = 1.664 * colNC_6 + colNC_2;      colNC_1 = 1.;    } else if (indx == 3.0) {      colNC_5 = colNC_5 + colNC_3;      colNC_4 = 0.032 * colNC_6 + colNC_4;      colNC_3 = 0.712 * colNC_6 + colNC_3;      colNC_1 = 0.672 * colNC_6 + colNC_1;    } else if (indx == 4.0) {      colNC_5 = colNC_5 + colNC_3;      colNC_3 = 1.680 * colNC_5 + colNC_3 - 1.;      colNC_4 = 0.784 * colNC_6 + colNC_4;      colNC_3 = 0.736 * colNC_6 + colNC_3;      colNC_1 = -0.016 * colNC_6 + colNC_1;    } else if (indx == 5.0) {      colNC_5 = colNC_5 + colNC_3;      colNC_4 = 0.016 * colNC_6 + colNC_4;      colNC_3 = 0.000 * colNC_6 + colNC_3;      colNC_2 = 0.328 * colNC_6 + colNC_2;      colNC_1 = 0.992 * (colNC_6 - 0.024) + colNC_1;    } else if (indx == 6.0) {      colNC_5 = colNC_5 + colNC_3;    } else if (indx == 7.0) {      colNC_5 = colNC_5 + colNC_3;    } else if (indx == 8.0) {      colNC_5 = colNC_5 + colNC_3;    }      colNC_1 = -colNC_1 + 1.0;    colNC_1 = colNC_1 * (C.x);// NOT?    colNC_1 = -colNC_1 + 1.0;      colNC_2 = -colNC_2 + 1.0;    colNC_2 = colNC_2 * ((-C.x + 1.0) - (-C.z + 1.0));    colNC_2 = -colNC_2 + 1.0;        colNC_3 = -colNC_3 + 1.0;    colNC_3 = colNC_3 * (-C.x + 1.0);    colNC_3 = -colNC_3 + 1.0;      colNC_4 = -colNC_4 + 1.0;    colNC_4 = colNC_4 * (-C.y + 1.0);    colNC_4 = -colNC_4 + 1.0;      colNC_5 = -colNC_5 + 1.0;    colNC_5 = colNC_5 * (-C.y + 1.0);    colNC_5 = -colNC_5 + 1.0;        float colB_1 = BlendScreen(colNC_1, colLC_1);    float colB_2 = BlendScreen(colNC_2, colLC_2);    float colB_3 = BlendScreen(colNC_3, colLC_3);    float colB_4 = BlendScreen(colNC_4, colLC_4);    float colB_5 = BlendScreen(colNC_5, colLC_5);    float colF_1 = SmoothStep(cBlend, 1., colB_1);    float colF_2 = SmoothStep(cBlend, 1., colB_2);    float colF_3 = SmoothStep(cBlend, 1., colB_3);    float colF_4 = SmoothStep(cBlend, 1., colB_4);    float colF_5 = SmoothStep(cBlend, 1., colB_5);    float colF = min(colF_1, colF_2);    colF = min(colF, colF_3);    colF = min(colF, colF_4);    colF = min(colF, colF_5);    color = vec3(colF);        if (st.y >= clear) {      C = vec3(1.0);      C.x = 1.0;      C.y = 1.0;      C.z = 1.0;      color = vec3(1.0);    }        if (st.y <= horizon) {      color = vec3(ground);    }      if (night <= 1.0) {      if (st.y > horizon) {        color = mix(1.0 - color, vec3(1.0 - night), color);      }    }          gl_FragColor = vec4(color, color.x);  } ";    
let dvString = "\n#ifdef GL_ES \n precision mediump float;  \n#endif  \n    attribute vec3 aPosition; \n attribute vec2 aTexCoord;   \n varying vec2 vUV; \n   void main() {\n    vUV = aTexCoord;  \n    vec4 position = vec4(aPosition, 1.0);   \n position.xy = position.xy * 2.0 - 1.0;  \n  gl_Position = position; \n } ";   
let dfString = "\n #ifdef GL_ES \n precision mediump float; \n #endif  \n     varying vec2 vUV;  \n  uniform sampler2D tex; \n uniform vec3 Col;  \n  void main() {   \n vec4 texColor2 = texture2D(tex, vUV);  \n      vec3 C = vec3(texColor2.xyz);   \n vec3 swatch = Col;  \n  C = mix(swatch, vec3(1.0), C);   \n gl_FragColor = vec4(C, 1.0);   \n }" ;  


// Aditional Scripts for UI overlay 
function saveCanvas(){
  //save("mySketch" + sketchNum + '_' + plot.category + '_' + stackList[0].category + ".png");
//save("mySketch" + ".png");
//sketchNum ++;
console.log("Printing!")
isLooping = false;
savFlag = false;
loop();
//highResShot(2);

LoaderDiv.style.display = "block";





//initCam(cams[camIndx].O);

//redraw();


prtScn = true;
}

function updateM(target, data) {
  M.var[target] = data;
}
function reloadPage() {
  console.log("reload app!");
  window.location.href = window.location.href;
}


function setSeed(){
  console.log("setSeed!")
  // console.log(M.var.nextSeed)
  sReload.setNextSeed()
} 

function logM() {
  console.log( fxhash);
  console.log("M", M);
  console.log("window",window.M);
}

function saveCanvasImage() {
  saveCanvas('henge', 'png');
}
























