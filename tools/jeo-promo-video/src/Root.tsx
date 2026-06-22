import { Composition } from "remotion";
import { JeoPromo } from "./JeoPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JeoPromo"
        component={JeoPromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
