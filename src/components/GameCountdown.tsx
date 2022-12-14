import React, { useMemo } from "react";
import { TimerState, useTimerEvent } from "../store/useGame";

const GameCountdown = () => {
  const data = useTimerEvent() as TimerState;

  const time = useMemo(() => {
    if (typeof data.countDown === "number") {
      return data.countDown;
    } else {
      return data?.countDown?.split(":");
    }
  }, [data?.countDown]);

  return Object.keys(data).length > 0 && data ? (
    <div className="m-auto">
      <span className="countdown m-auto mt-10 font-mono text-6xl">
        {typeof data.countDown === "number" ? (
          <span className="" style={{ "--value": time } as any}></span>
        ) : (
          <>
            <span
              className=""
              style={{ "--value": parseInt(time[0] as string) } as any}
            ></span>
            m
            <span
              className=""
              style={{ "--value": parseInt(time[1] as string) } as any}
            ></span>
            s
          </>
        )}
      </span>
      <div className="mt-3 text-center text-lg font-bold text-secondary">
        {data?.msg}
      </div>
    </div>
  ) : null;
};

export default GameCountdown;
