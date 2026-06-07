import { generateChartSequenceOfDates } from "../../models/charting";
import { FinKittyDate } from "../../utils/utils";

describe("generateChartSequenceOfDates", () => {
  it("monthly chart buckets follow ROI start day, not calendar 1st", () => {
    const roi = {
      start: new FinKittyDate(new Date(2018, 0, 15)),
      end: new FinKittyDate(new Date(2018, 4, 20)),
    };
    const dates = generateChartSequenceOfDates(roi, "1m");
    // makeChartData drops the pre-date
    dates.shift();

    expect(dates[0].getTestDescription()).toBe("Mon Jan 15 2018");
    expect(dates[1].getTestDescription()).toBe("Thu Feb 15 2018");
    expect(dates[2].getTestDescription()).toBe("Thu Mar 15 2018");
    expect(dates[3].getTestDescription()).toBe("Sun Apr 15 2018");
  });

  it("includes a pre-date one month before ROI start", () => {
    const roi = {
      start: new FinKittyDate(new Date(2018, 0, 15)),
      end: new FinKittyDate(new Date(2018, 1, 20)),
    };
    const dates = generateChartSequenceOfDates(roi, "1m");
    expect(dates[0].getTestDescription()).toBe("Fri Dec 15 2017");
    expect(dates[1].getTestDescription()).toBe("Mon Jan 15 2018");
  });
});
