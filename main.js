import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// GSAP and Lenis are loaded globally via script tags in index.html

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// --- SMOOTH SCROLLING (Lenis) ---
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
});

function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// --- THREE.JS SETUP ---
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8); // Start further back

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00f3ff, 5, 20); // Neon Cyan
pointLight1.position.set(2, 3, 4);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xbc13fe, 5, 20); // Neon Purple
pointLight2.position.set(-2, -3, -4);
scene.add(pointLight2);

// --- 3D OBJECTS ---

// 1. Central Hero Sculpture (Holographic Cyber Structure)
const sculpture = new THREE.Group();
sculpture.position.x = window.innerWidth > 768 ? 2 : 0; // Centered on mobile, offset on desktop

const geometry = new THREE.IcosahedronGeometry(1.8, 1);
const material = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    emissive: 0x00f3ff,
    emissiveIntensity: 0.2,
    wireframe: true,
    transparent: true,
    opacity: 0.8
});
const outerShell = new THREE.Mesh(geometry, material);
sculpture.add(outerShell);

const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
const innerMat = new THREE.MeshPhysicalMaterial({
    color: 0x020205,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.2
});
const innerCore = new THREE.Mesh(innerGeo, innerMat);
sculpture.add(innerCore);

scene.add(sculpture);

// 1.5 Grid Floor (Futuristic Landscape)
const gridHelper = new THREE.GridHelper(60, 60, 0x00f3ff, 0xbc13fe);
gridHelper.position.y = -3;
gridHelper.material.opacity = 0.15;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// 2. Background Particle Field (Magic Dust)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i+=3) {
    // Cyber data stream particles
    posArray[i] = (Math.random() - 0.5) * 40;
    posArray[i+1] = (Math.random() - 0.5) * 20;
    posArray[i+2] = (Math.random() - 0.5) * 40;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- POST-PROCESSING (Glow/Bloom effect) ---
const isMobile = /Mobi/i.test(navigator.userAgent);
let composer;
if (!isMobile) {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
}

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(composer) composer.setSize(window.innerWidth, window.innerHeight);
    sculpture.position.x = window.innerWidth > 768 ? 2 : 0;
});

// --- MOUSE PARALLAX ---
const mouse = new THREE.Vector2();
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX - windowHalfX);
    mouse.y = (event.clientY - windowHalfY);
});

// --- SCROLL ANIMATIONS (GSAP & ScrollTrigger) ---

// 1. Camera Fly-through
const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 8),      // Hero
    new THREE.Vector3(-4, -2, 4),    // About
    new THREE.Vector3(0, 0, 6),      // Works
    new THREE.Vector3(0, 0, 2),      // Contact (Close up)
]);

ScrollTrigger.create({
    trigger: document.body,
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrub
    onUpdate: (self) => {
        // Move camera along path
        const point = cameraPath.getPoint(self.progress);
        camera.position.copy(point);
        // Look back at the sculpture
        camera.lookAt(sculpture.position);
    }
});

// 2. Sculpture Morphing based on Sections
gsap.to(sculpture.rotation, {
    x: Math.PI * 4,
    y: Math.PI * 2,
    scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
    }
});

// 3. HTML Content Reveal Animations
// Hero Text Intro
gsap.from(".main-title", {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: "back.out(1.5)",
    delay: 0.2
});

gsap.from(".hero-desc, .cta-btn", {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power3.out",
    delay: 0.8,
    stagger: 0.2
});

// Scroll Reveals for the rest
gsap.utils.toArray('.glass-panel, .section-title').forEach(elem => {
    gsap.from(elem, {
        scrollTrigger: {
            trigger: elem,
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// --- ANIMATION FRAME LOOP ---
const clock = new THREE.Clock();

function animate() {
    targetX = mouse.x * .001;
    targetY = mouse.y * .001;

    // Slight parallax on particles based on mouse
    particlesMesh.rotation.y += 0.0005;
    
    // Animate inner core differently
    if (sculpture.children.length > 1) {
        sculpture.children[1].rotation.y -= 0.005;
        sculpture.children[1].rotation.x -= 0.002;
    }

    // Parallax on entire scene instead to not conflict with GSAP scrub on sculpture
    scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
    scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
    
    // Data stream moving up effect
    const positions = particlesMesh.geometry.attributes.position.array;
    for(let i = 1; i < positions.length; i+=3) {
        positions[i] += 0.02;
        if(positions[i] > 10) positions[i] = -10;
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;

    particlesMesh.position.x += 0.05 * (targetX - particlesMesh.position.x);
    particlesMesh.position.y += 0.05 * (-targetY - particlesMesh.position.y);

    if (composer && !isMobile) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
    
    requestAnimationFrame(animate);
}

// Refresh ScrollTrigger on load to recalculate heights
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});

// --- MOBILE MENU FUNCTIONALITY ---
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('#nav-menu');
const navLinks = document.querySelectorAll('#nav-menu a');

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('open');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('open');
            navMenu.classList.remove('active');
        });
    });
}

animate();
