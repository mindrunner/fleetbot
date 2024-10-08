// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sleep = (ms: number) =>
    // eslint-disable-next-line promise/avoid-new
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
