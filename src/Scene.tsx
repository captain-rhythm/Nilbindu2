import { KageLandingPage } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { ThreeDPaper } from "./shaders/3d-paper/ThreeDPaper";
import "./shaders/threeui.css";

export function Scene() {
  return (
    <div className="nilbindu-app">
      <section className="nilbindu-about" aria-labelledby="nilbindu-about-title">
        <div className="nilbindu-about__copy">
          <p className="nilbindu-about__eyebrow">About Nilbindu</p>
          <h1 id="nilbindu-about-title">Pure water, built for every community.</h1>
          <p>
            Nilbindu develops accessible, dependable water filtration systems that
            turn practical engineering into lasting community health.
          </p>
        </div>
        <div className="nilbindu-about__paper">
          <ThreeDPaper variant="original" />
        </div>
      </section>
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />
    </div>
  );
}
