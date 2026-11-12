import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const benefitsAndLimitations: EvArticle = {
  slug: "benefits-and-limitations",
  title: L("EV benefits and limitations", "ইভির সুবিধা ও সীমাবদ্ধতা"),
  summary: L(
    "An honest, balanced view: where EVs shine, where they still fall short, what they really mean for the environment, and who they suit best.",
    "সৎ ও ভারসাম্যপূর্ণ দৃষ্টিতে: ইভি কোথায় এগিয়ে, কোথায় এখনো পিছিয়ে, পরিবেশের জন্য আসলে কী অর্থ বহন করে, আর কার জন্য সবচেয়ে উপযোগী।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "benefits",
      title: L("The benefits", "সুবিধাগুলো"),
      blocks: [
        {
          type: "list",
          items: [
            L("Lower energy cost per kilometre in most cases, especially when you charge at home.", "বেশিরভাগ ক্ষেত্রে প্রতি কিলোমিটারে শক্তির খরচ কম, বিশেষ করে বাসায় চার্জ দিলে।"),
            L("Less routine maintenance: no oil changes, spark plugs or exhaust.", "নিয়মিত রক্ষণাবেক্ষণ কম: অয়েল বদল, স্পার্ক প্লাগ বা এক্সজস্টের ঝামেলা নেই।"),
            L("Quiet, smooth and quick, with instant response in traffic.", "নীরব, মসৃণ আর দ্রুত; যানজটে তাৎক্ষণিক সাড়া।"),
            L("No exhaust fumes on the street, which helps city air.", "রাস্তায় কোনো ধোঁয়া নেই, যা শহরের বাতাসের জন্য ভালো।"),
            L("Charging at home overnight means starting most days with a full battery.", "রাতভর বাসায় চার্জ দিলে বেশিরভাগ দিন শুরু হয় পূর্ণ ব্যাটারিতে।"),
            L("Regenerative braking recovers energy in stop-and-go traffic.", "থেমে থেমে চলা যানজটে রিজেনারেটিভ ব্রেকিং শক্তি ফেরত আনে।"),
          ],
        },
      ],
    },
    {
      id: "limitations",
      title: L("The limitations", "সীমাবদ্ধতাগুলো"),
      blocks: [
        {
          type: "list",
          items: [
            L("Many models cost more to buy than a comparable petrol car.", "অনেক মডেল কিনতে তুলনীয় পেট্রোল গাড়ির চেয়ে দাম বেশি।"),
            L("Public charging is still growing and is limited in many areas, so longer trips need planning.", "পাবলিক চার্জিং এখনো বাড়ছে, অনেক এলাকায় সীমিত, তাই লম্বা যাত্রায় পরিকল্পনা লাগে।"),
            L("Charging takes longer than filling a tank, even on a fast charger.", "ফাস্ট চার্জারেও চার্জ দিতে তেল ভরার চেয়ে বেশি সময় লাগে।"),
            L("Range falls with high speed, heavy air-conditioning use and full loads.", "বেশি গতি, এসির বেশি ব্যবহার আর পুরো বোঝায় রেঞ্জ কমে যায়।"),
            L("You need regular access to parking with a suitable power supply.", "উপযুক্ত বিদ্যুৎ সংযোগসহ পার্কিংয়ে নিয়মিত যাওয়ার সুযোগ লাগে।"),
            L("Replacing a battery outside its warranty is expensive, and resale values are less established than for petrol cars.", "ওয়ারেন্টির বাইরে ব্যাটারি বদলানো ব্যয়বহুল, আর পেট্রোল গাড়ির মতো পুনর্বিক্রয় মূল্য এখনো তেমন প্রতিষ্ঠিত নয়।"),
            L("Repairs need specialist skills, tools and parts, which aren't available everywhere.", "মেরামতে বিশেষ দক্ষতা, যন্ত্র আর যন্ত্রাংশ লাগে, যা সব জায়গায় পাওয়া যায় না।"),
          ],
        },
      ],
    },
    {
      id: "environment",
      title: L("The environment, honestly", "পরিবেশ: সৎ হিসাব"),
      blocks: [
        {
          type: "p",
          text: L(
            "An EV has no tailpipe, so it adds nothing to the fumes on a busy street. Its total footprint, though, also depends on how the electricity is generated and on manufacturing, and making the battery takes a lot of energy.",
            "ইভির কোনো এক্সজস্ট পাইপ নেই, তাই ব্যস্ত রাস্তার ধোঁয়ায় এর কোনো অবদান নেই। তবে এর মোট প্রভাব নির্ভর করে বিদ্যুৎ কীভাবে উৎপাদন হয় আর তৈরির প্রক্রিয়ার ওপর, আর ব্যাটারি তৈরিতে অনেক শক্তি লাগে।",
          ),
        },
        {
          type: "p",
          text: L(
            "Many life-cycle studies find that, over its whole life, an EV produces less greenhouse gas than a comparable petrol car. How large the advantage is depends on the local electricity mix and grows as grids get cleaner.",
            "অনেক জীবনচক্র গবেষণায় দেখা গেছে, পুরো জীবনকালে একটি ইভি তুলনীয় পেট্রোল গাড়ির চেয়ে কম গ্রিনহাউস গ্যাস তৈরি করে। এই সুবিধা কতটা বড় হবে, তা নির্ভর করে স্থানীয় বিদ্যুৎ উৎপাদনের মিশ্রণের ওপর, আর গ্রিড যত পরিচ্ছন্ন হয়, সুবিধা তত বাড়ে।",
          ),
        },
      ],
    },
    {
      id: "fit",
      title: L("Who an EV suits", "ইভি কার জন্য উপযোগী"),
      blocks: [
        {
          type: "list",
          items: [
            L("A good fit: you can charge at home or work, drive mostly in and around the city, and keep cars for several years.", "ভালো মানানসই: বাসা বা অফিসে চার্জ দিতে পারেন, বেশিরভাগ শহর ও আশপাশে চালান, আর গাড়ি কয়েক বছর রাখেন।"),
            L("Think carefully: you have no regular place to charge, often drive long distances away from chargers, or change cars every year or two.", "ভালো করে ভাবুন: নিয়মিত চার্জের জায়গা নেই, প্রায়ই চার্জার থেকে দূরে লম্বা পথ চালান, অথবা এক-দুই বছর পরপর গাড়ি বদলান।"),
          ],
        },
        {
          type: "callout",
          tone: "tip",
          text: L(
            "A test drive and a few minutes with the savings calculator will tell you more than any list.",
            "যেকোনো তালিকার চেয়ে একটি টেস্ট ড্রাইভ আর কয়েক মিনিট সাশ্রয় ক্যালকুলেটরে সময় দিলে বেশি জানতে পারবেন।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Are EVs really cheaper overall?", "সব মিলিয়ে ইভি কি সত্যিই সাশ্রয়ী?"),
      a: L(
        "It depends on the purchase price, how far you drive, energy prices and how long you keep the car. The more you drive and the longer you keep it, the more the lower running costs count.",
        "নির্ভর করে কেনার দাম, কতটা চালান, শক্তির দাম আর গাড়ি কত দিন রাখবেন তার ওপর। যত বেশি চালাবেন আর যত বেশি দিন রাখবেন, কম চালানোর খরচের সুবিধা তত বেশি।",
      ),
    },
    {
      q: L("Is the range enough for city driving?", "শহরে চালানোর জন্য রেঞ্জ কি যথেষ্ট?"),
      a: L(
        "For typical daily city driving, most modern EVs have range to spare, especially if you charge at home overnight. It's longer trips that need planning.",
        "শহরের সাধারণ প্রতিদিনের চালানোর জন্য বেশিরভাগ আধুনিক ইভির রেঞ্জ যথেষ্টর চেয়েও বেশি, বিশেষ করে রাতে বাসায় চার্জ দিলে। পরিকল্পনা লাগে লম্বা যাত্রায়।",
      ),
    },
    {
      q: L("Will EVs hold their value?", "ইভির দাম কি টিকে থাকবে?"),
      a: L(
        "It's harder to predict than for petrol cars, because the market is younger and technology is moving quickly. A documented battery health report helps a lot when you sell.",
        "পেট্রোল গাড়ির চেয়ে অনুমান করা কঠিন, কারণ বাজার নতুন আর প্রযুক্তি দ্রুত বদলাচ্ছে। বিক্রির সময় নথিভুক্ত ব্যাটারি হেলথ রিপোর্ট অনেক কাজে দেয়।",
      ),
    },
  ],
  related: ["compare-powertrains", "ownership-guide-bangladesh", "charging"],
};
