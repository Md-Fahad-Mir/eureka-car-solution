import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const comparePowertrains: EvArticle = {
  slug: "compare-powertrains",
  title: L("EV vs petrol vs diesel vs hybrid vs PHEV", "ইভি, পেট্রোল, ডিজেল, হাইব্রিড আর পিএইচইভি: তুলনা"),
  summary: L(
    "A side-by-side look at the five main powertrains: how they're refuelled, what they cost to run, what they need in maintenance and who each one suits.",
    "পাঁচটি প্রধান পাওয়ারট্রেন পাশাপাশি: কীভাবে জ্বালানি বা চার্জ নেয়, চালাতে খরচ কত, রক্ষণাবেক্ষণে কী লাগে, আর কোনটি কার জন্য।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "at-a-glance",
      title: L("At a glance", "এক নজরে"),
      blocks: [
        {
          type: "table",
          caption: L("How the five powertrains compare (general guide)", "পাঁচটি পাওয়ারট্রেনের তুলনা (সাধারণ নির্দেশনা)"),
          columns: [L("EV", "ইভি"), L("Plug-in hybrid", "প্লাগ-ইন হাইব্রিড"), L("Hybrid", "হাইব্রিড"), L("Petrol", "পেট্রোল"), L("Diesel", "ডিজেল")],
          rows: [
            {
              label: L("Energy", "শক্তির উৎস"),
              cells: [L("Electricity", "বিদ্যুৎ"), L("Electricity and petrol", "বিদ্যুৎ ও পেট্রোল"), L("Petrol, helped by a self-charging battery", "পেট্রোল, সঙ্গে নিজে চার্জ হওয়া ব্যাটারি"), L("Petrol (octane)", "পেট্রোল (অকটেন)"), L("Diesel", "ডিজেল")],
            },
            {
              label: L("Refuelling", "জ্বালানি/চার্জ নেওয়া"),
              cells: [
                L("Plug in: overnight at home, under an hour on DC fast charging", "প্লাগ লাগিয়ে: বাসায় রাতভর, ডিসি ফাস্ট চার্জারে এক ঘণ্টার কম"),
                L("Plug in, or fill up", "প্লাগ লাগিয়ে, অথবা তেল ভরে"),
                L("Fill up at a pump", "পাম্পে তেল ভরে"),
                L("Fill up at a pump", "পাম্পে তেল ভরে"),
                L("Fill up at a pump", "পাম্পে তেল ভরে"),
              ],
            },
            {
              label: L("Energy cost per km", "প্রতি কিমিতে জ্বালানি খরচ"),
              cells: [L("Usually the lowest", "সাধারণত সবচেয়ে কম"), L("Low if charged often", "নিয়মিত চার্জ দিলে কম"), L("Lower than petrol", "পেট্রোলের চেয়ে কম"), L("Highest", "সবচেয়ে বেশি"), L("Moderate", "মাঝারি")],
            },
            {
              label: L("Tailpipe emissions", "ধোঁয়া নির্গমন"),
              cells: [L("None", "নেই"), L("None when driving on electricity", "বিদ্যুতে চালালে নেই"), L("Lower than petrol", "পেট্রোলের চেয়ে কম"), L("Yes", "আছে"), L("Yes, and needs good exhaust after-treatment", "আছে, ভালো এক্সজস্ট পরিশোধন দরকার")],
            },
            {
              label: L("Routine maintenance", "নিয়মিত রক্ষণাবেক্ষণ"),
              cells: [L("Least", "সবচেয়ে কম"), L("Both systems to look after", "দুই সিস্টেমেরই যত্ন লাগে"), L("Like petrol; brakes last longer", "পেট্রোলের মতো; ব্রেক বেশি দিন টেকে"), L("Regular oil and filter changes", "নিয়মিত অয়েল ও ফিল্টার বদল"), L("Regular, plus fuel-system care", "নিয়মিত, সঙ্গে ফুয়েল সিস্টেমের যত্ন")],
            },
            {
              label: L("Long trips", "লম্বা যাত্রা"),
              cells: [L("Plan charging stops", "চার্জিং বিরতির পরিকল্পনা লাগে"), L("Easy", "সহজ"), L("Easy", "সহজ"), L("Easy", "সহজ"), L("Easy, with long range", "সহজ, রেঞ্জও বেশি")],
            },
            {
              label: L("Best for", "সবচেয়ে উপযোগী"),
              cells: [
                L("Daily driving with charging at home or work", "বাসা বা অফিসে চার্জের সুবিধাসহ প্রতিদিনের চলাচল"),
                L("Mostly short trips, with occasional long journeys", "বেশিরভাগ ছোট যাত্রা, মাঝে মাঝে লম্বা পথ"),
                L("Lots of city driving, without a place to charge", "শহরে বেশি চালানো, চার্জের জায়গা নেই"),
                L("Lower purchase price and any kind of trip", "কম দামে কেনা, যেকোনো ধরনের যাত্রা"),
                L("High mileage, heavy loads and towing", "বেশি মাইলেজ, ভারী বোঝা আর টানার কাজ"),
              ],
            },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          text: L(
            "This is a general guide. Real costs depend on the exact vehicle, current fuel and electricity prices, and how you drive. The savings calculator works it out with your numbers.",
            "এটি সাধারণ নির্দেশনা। আসল খরচ নির্ভর করে নির্দিষ্ট গাড়ি, জ্বালানি ও বিদ্যুতের বর্তমান দাম আর আপনার চালানোর ধরনের ওপর। সাশ্রয় ক্যালকুলেটর আপনার হিসাব দিয়েই সেটা বের করে।",
          ),
        },
      ],
    },
    {
      id: "running-costs",
      title: L("What a kilometre costs", "এক কিলোমিটারের খরচ"),
      blocks: [
        {
          type: "p",
          text: L(
            "The biggest everyday difference is the energy cost of each kilometre. Here it is for typical vehicles, using the sample prices from our calculator:",
            "প্রতিদিনের সবচেয়ে বড় পার্থক্য প্রতি কিলোমিটারের জ্বালানি বা বিদ্যুৎ খরচে। আমাদের ক্যালকুলেটরের নমুনা দাম ধরে সাধারণ গাড়ির হিসাব নিচে:",
          ),
        },
        { type: "costPerKm" },
        {
          type: "callout",
          tone: "local",
          text: L(
            "Fuel and electricity prices are set by the authorities and change from time to time. Check current prices before you decide.",
            "জ্বালানি ও বিদ্যুতের দাম কর্তৃপক্ষ নির্ধারণ করে, আর সময়ে সময়ে বদলায়। সিদ্ধান্তের আগে বর্তমান দাম মিলিয়ে নিন।",
          ),
        },
      ],
    },
    {
      id: "choosing",
      title: L("How to choose", "কীভাবে বেছে নেবেন"),
      blocks: [
        {
          type: "list",
          items: [
            L("You can charge at home or work, and most days are under a couple of hundred kilometres: an EV is likely the cheapest to run.", "বাসা বা অফিসে চার্জ দিতে পারেন, আর বেশিরভাগ দিন দুইশো কিলোমিটারের কম চালান: চালানোর খরচে ইভিই সম্ভবত সবচেয়ে সাশ্রয়ী।"),
            L("You can charge, but often drive far from charging points: a plug-in hybrid covers both.", "চার্জ দিতে পারেন, কিন্তু প্রায়ই চার্জিং পয়েন্ট থেকে দূরে যান: প্লাগ-ইন হাইব্রিড দুটোই সামলায়।"),
            L("You can't charge, and drive mostly in town: a hybrid saves fuel with no change in habits.", "চার্জ দেওয়ার সুযোগ নেই, আর বেশিরভাগ শহরেই চালান: অভ্যাস না বদলেই হাইব্রিড জ্বালানি বাঁচায়।"),
            L("You cover long distances or carry heavy loads: diesel remains a strong choice.", "লম্বা দূরত্ব পাড়ি দেন বা ভারী মালামাল বহন করেন: ডিজেল এখনো ভালো পছন্দ।"),
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Is a plug-in hybrid the best of both worlds?", "প্লাগ-ইন হাইব্রিড কি দুই দিকেরই সেরা?"),
      a: L(
        "Only if you charge it regularly. Driven mostly on petrol, it carries a heavy battery for little benefit and can use more fuel than a regular hybrid.",
        "শুধু নিয়মিত চার্জ দিলে। বেশিরভাগ সময় পেট্রোলে চালালে অল্প লাভের জন্য ভারী ব্যাটারি বয়ে বেড়াতে হয়, আর সাধারণ হাইব্রিডের চেয়েও বেশি জ্বালানি লাগতে পারে।",
      ),
    },
    {
      q: L("Which is cleanest for the environment?", "পরিবেশের জন্য কোনটি সবচেয়ে পরিচ্ছন্ন?"),
      a: L(
        "EVs produce no exhaust on the street, which helps city air. Their overall footprint also depends on how the electricity is generated and on manufacturing, so the benefit varies by country.",
        "রাস্তায় ইভি কোনো ধোঁয়া ছাড়ে না, যা শহরের বাতাসের জন্য ভালো। তবে সামগ্রিক প্রভাব নির্ভর করে বিদ্যুৎ কীভাবে উৎপাদন হয় আর গাড়ি তৈরির ওপর, তাই দেশভেদে লাভের মাত্রা আলাদা।",
      ),
    },
    {
      q: L("Is diesel still worth it?", "ডিজেল কি এখনো লাভজনক?"),
      a: L(
        "For high mileage, heavy loads and commercial work, often yes. For short city trips, a hybrid or EV usually costs less to run.",
        "বেশি মাইলেজ, ভারী বোঝা আর বাণিজ্যিক কাজে প্রায়ই হ্যাঁ। শহরের ছোট যাত্রায় সাধারণত হাইব্রিড বা ইভি চালাতে খরচ কম।",
      ),
    },
  ],
  related: ["benefits-and-limitations", "what-is-an-ev", "charging"],
};
