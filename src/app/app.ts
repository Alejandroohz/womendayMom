import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  photoSlots: { id: string; num: number; icon: string; label: string; imgSrc: SafeUrl | string }[] = [
    { id: 'slot1', num: 1, icon: '📷', label: 'Nuestra foto favorita',      imgSrc: 'nya.jpeg' },
    { id: 'slot2', num: 2, icon: '💙', label: 'Agrega una foto',             imgSrc: 'mom.jpeg' },
    { id: 'slot3', num: 3, icon: '🌸', label: 'Agrega una foto',             imgSrc: 'momfit.jpeg' },
    { id: 'slot4', num: 4, icon: '🌺', label: 'Un momento especial contigo', imgSrc: 'oneyear.jpeg' },
    { id: 'slot5', num: 5, icon: '✨', label: 'Agrega una foto',             imgSrc: 'firststeaps.jpeg' },
  ];

  reasons = [
    { emoji: '💙', text: 'Eres la razón por la que soy quien soy hoy' },
    { emoji: '🌟', text: 'Tu amor incondicional me da fuerza cada día' },
    { emoji: '🤱', text: 'Eres la mejor madre que el mundo pudo darme' },
    { emoji: '🦋', text: 'Me enseñaste a volar con tus propias alas' },
    { emoji: '✨', text: 'Cada recuerdo a tu lado es un tesoro para mí' },
    { emoji: '💖', text: 'Eres la mujer más importante de mi vida' },
  ];

  private activeSlot: string | null = null;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private pieces: any[] = [];
  private animating = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      this.initConfetti();
      this.launchConfetti();
    }, 1200);
  }

  private initConfetti(): void {
    this.canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    this.ctx    = this.canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launchConfetti(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.canvas) this.initConfetti();
    const colors = ['#4a90d9','#74c7f7','#00b4d8','#1a5fb4','#ffd166','#06d6a0','#e0f0ff'];
    const shapes = ['●','♥','★','✦'];
    this.pieces  = [];

    for (let i = 0; i < 180; i++) {
      this.pieces.push({
        x:        Math.random() * this.canvas.width,
        y:        -20,
        size:     8 + Math.random() * 14,
        color:    colors[Math.floor(Math.random() * colors.length)],
        shape:    shapes[Math.floor(Math.random() * shapes.length)],
        vx:       (Math.random() - 0.5) * 6,
        vy:       2 + Math.random() * 5,
        rot:      Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        opacity:  1,
      });
    }

    if (!this.animating) this.animateConfetti();
  }

  private animateConfetti(): void {
    this.animating = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.pieces.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.rotSpeed;
      p.vy  += 0.08;
      if (p.y > this.canvas.height * 0.8) p.opacity -= 0.02;

      this.ctx.save();
      this.ctx.globalAlpha   = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rot * Math.PI) / 180);
      this.ctx.font          = `${p.size}px serif`;
      this.ctx.fillStyle     = p.color;
      this.ctx.textAlign     = 'center';
      this.ctx.textBaseline  = 'middle';
      this.ctx.fillText(p.shape, 0, 0);
      this.ctx.restore();
    });

    this.pieces = this.pieces.filter(p => p.opacity > 0 && p.y < this.canvas.height + 50);

    if (this.pieces.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.animating = false;
    }
  }

  openFilePicker(slotId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const slot = this.photoSlots.find(s => s.id === slotId);
    if (slot?.imgSrc) return;
    this.activeSlot = slotId;
    (document.getElementById('file-input') as HTMLInputElement).click();
  }

  loadPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.activeSlot) return;

    const objUrl = URL.createObjectURL(input.files[0]);
    const slot   = this.photoSlots.find(s => s.id === this.activeSlot);
    if (slot) slot.imgSrc = this.sanitizer.bypassSecurityTrustUrl(objUrl);
    input.value  = '';
  }
}