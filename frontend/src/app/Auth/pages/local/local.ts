import { Component, ElementRef, inject, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { gsap } from 'gsap/gsap-core'

@Component({
  selector: 'app-local',
  styleUrl: './local.css',
  templateUrl: './local.html',
})
export class Local {
  private readonly router = inject(Router)

  @ViewChild('bellWrap') bellWrapRef!: ElementRef

  protected onBellClick(): void {
    gsap.to(this.bellWrapRef.nativeElement, {
      y: -30,
      scale: 0.8,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => this.router.navigate(['/login'])
    })
  }

  protected onBellHover(): void {
    gsap.to(this.bellWrapRef.nativeElement, {
      rotation: 10,
      duration: 0.1,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 5
    })
  }

  protected onBellLeave(): void {
    gsap.to(this.bellWrapRef.nativeElement, {
      rotation: 0,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)'
    })
  }
}
