// Fixed lists used by the data files. A data file may only use the keys below, so the same city or
// specialty is never written two different ways. To add a new one, add a line here.

// bn: name; in: 'in X' form; of: 'of X' form (Bangla changes the ending, so both are written out)
export const CITIES = {
  sylhet: { bn: 'সিলেট', en: 'Sylhet', in: 'সিলেটে', of: 'সিলেটের' },
  moulvibazar: { bn: 'মৌলভীবাজার', en: 'Moulvibazar', in: 'মৌলভীবাজারে', of: 'মৌলভীবাজারের' },
  habiganj: { bn: 'হবিগঞ্জ', en: 'Habiganj', in: 'হবিগঞ্জে', of: 'হবিগঞ্জের' },
  sunamganj: { bn: 'সুনামগঞ্জ', en: 'Sunamganj', in: 'সুনামগঞ্জে', of: 'সুনামগঞ্জের' },
  dhaka: { bn: 'ঢাকা', en: 'Dhaka', in: 'ঢাকায়', of: 'ঢাকার' },
  chattogram: { bn: 'চট্টগ্রাম', en: 'Chattogram', in: 'চট্টগ্রামে', of: 'চট্টগ্রামের' },
  naogaon: { bn: 'নওগাঁ', en: 'Naogaon', in: 'নওগাঁয়', of: 'নওগাঁর' },
  bogura: { bn: 'বগুড়া', en: 'Bogura', in: 'বগুড়ায়', of: 'বগুড়ার' },
  rajshahi: { bn: 'রাজশাহী', en: 'Rajshahi', in: 'রাজশাহীতে', of: 'রাজশাহীর' },
  khulna: { bn: 'খুলনা', en: 'Khulna', in: 'খুলনায়', of: 'খুলনার' },
  barishal: { bn: 'বরিশাল', en: 'Barishal', in: 'বরিশালে', of: 'বরিশালের' },
  rangpur: { bn: 'রংপুর', en: 'Rangpur', in: 'রংপুরে', of: 'রংপুরের' },
  mymensingh: { bn: 'ময়মনসিংহ', en: 'Mymensingh', in: 'ময়মনসিংহে', of: 'ময়মনসিংহের' },
  coxsbazar: { bn: 'কক্সবাজার', en: "Cox's Bazar", in: 'কক্সবাজারে', of: 'কক্সবাজারের' },
  rangamati: { bn: 'রাঙামাটি', en: 'Rangamati', in: 'রাঙামাটিতে', of: 'রাঙামাটির' },
  bandarban: { bn: 'বান্দরবান', en: 'Bandarban', in: 'বান্দরবানে', of: 'বান্দরবানের' },
} as const;
export type City = keyof typeof CITIES;

// bn: short name for lists and titles; en: for the English line and search; schema: schema.org MedicalSpecialty
export const SPECIALTIES = {
  medicine: { bn: 'মেডিসিন বিশেষজ্ঞ', en: 'Medicine', schema: 'PrimaryCare' },
  gynecology: { bn: 'গাইনি বিশেষজ্ঞ', en: 'Gynecology & Obstetrics', schema: 'Obstetric' },
  pediatrics: { bn: 'শিশু বিশেষজ্ঞ', en: 'Pediatrics', schema: 'Pediatric' },
  cardiology: { bn: 'হৃদরোগ বিশেষজ্ঞ', en: 'Cardiology', schema: 'Cardiovascular' },
  hematology: { bn: 'রক্তরোগ বিশেষজ্ঞ', en: 'Hematology', schema: 'Hematologic' },
  surgery: { bn: 'সার্জারি বিশেষজ্ঞ', en: 'General Surgery', schema: 'Surgical' },
  colorectal: { bn: 'কোলোরেক্টাল সার্জন', en: 'Colorectal Surgery', schema: 'Surgical' },
  neurosurgery: { bn: 'নিউরো ও স্পাইন সার্জন', en: 'Neuro & Spine Surgery', schema: 'Surgical' },
  pediatric_surgery: { bn: 'শিশু সার্জন', en: 'Pediatric Surgery', schema: 'Surgical' },
  orthopedics: { bn: 'হাড় ও জোড়া বিশেষজ্ঞ', en: 'Orthopedics', schema: 'Musculoskeletal' },
  neurology: { bn: 'নিউরোলজি বিশেষজ্ঞ', en: 'Neurology', schema: 'Neurologic' },
  ent: { bn: 'নাক কান গলা বিশেষজ্ঞ', en: 'ENT', schema: 'Otolaryngologic' },
  eye: { bn: 'চক্ষু বিশেষজ্ঞ', en: 'Ophthalmology', schema: 'Optometric' },
  skin: { bn: 'চর্ম ও যৌন রোগ বিশেষজ্ঞ', en: 'Dermatology', schema: 'Dermatologic' },
  psychiatry: { bn: 'মানসিক রোগ বিশেষজ্ঞ', en: 'Psychiatry', schema: 'Psychiatric' },
  urology: { bn: 'ইউরোলজি বিশেষজ্ঞ', en: 'Urology', schema: 'Urologic' },
  nephrology: { bn: 'কিডনি বিশেষজ্ঞ', en: 'Nephrology', schema: 'Renal' },
  gastro: { bn: 'পেট ও লিভার বিশেষজ্ঞ', en: 'Gastroenterology', schema: 'Gastroenterologic' },
  oncology: { bn: 'ক্যান্সার বিশেষজ্ঞ', en: 'Oncology', schema: 'Oncologic' },
  diabetes: { bn: 'ডায়াবেটিস ও হরমোন বিশেষজ্ঞ', en: 'Endocrinology', schema: 'Endocrine' },
  chest: { bn: 'বক্ষব্যাধি বিশেষজ্ঞ', en: 'Pulmonology', schema: 'Pulmonary' },
  dental: { bn: 'দন্ত বিশেষজ্ঞ', en: 'Dentistry', schema: 'Dentistry' },
} as const;
export type Specialty = keyof typeof SPECIALTIES;

export const FACILITIES = {
  er: 'জরুরি বিভাগ', icu: 'আইসিইউ', ccu: 'সিসিইউ', nicu: 'এনআইসিইউ (নবজাতক)', dialysis: 'ডায়ালাইসিস', ot: 'অপারেশন থিয়েটার',
  lab: '২৪ ঘণ্টা ল্যাব', pharmacy: 'ফার্মেসি', ambulance: 'অ্যাম্বুলেন্স', lift: 'লিফট', parking: 'পার্কিং', canteen: 'ক্যান্টিন',
  atm: 'এটিএম বুথ', wifi: 'ফ্রি ওয়াই-ফাই',
} as const;
export type Facility = keyof typeof FACILITIES;

// Hotel facilities: a hotel file may only use these keys (icons are in src/lib/icons.ts)
export const HOTEL_FACILITIES = {
  pool: 'সুইমিং পুল', spa: 'স্পা ও সেলুন', gym: 'জিম', restaurant: 'রেস্টুরেন্ট', rooftop: 'রুফটপ রেস্টুরেন্ট', breakfast: 'ব্রেকফাস্ট', roomservice: 'রুম সার্ভিস',
  wifi: 'ফ্রি ওয়াই-ফাই', parking: 'পার্কিং', lift: 'লিফট', cinema: 'সিনেমা হল', kids: 'শিশুদের খেলার জায়গা', hall: 'বলরুম ও কনভেনশন', meeting: 'মিটিং রুম',
  cash: 'মুদ্রা বিনিময়', laundry: 'লন্ড্রি', tours: 'ট্যুর ডেস্ক', airport: 'বিমানবন্দর পিকআপ', beach: 'সৈকত সংলগ্ন', golf: 'গলফ', generator: 'জেনারেটর',
} as const;
export type HotelFacility = keyof typeof HOTEL_FACILITIES;

export const TEST_GROUPS = { lab: 'ল্যাব টেস্ট', imaging: 'এক্স-রে ও স্ক্যান', heart: 'হৃদরোগ', other: 'অন্যান্য' } as const;
export type TestGroup = keyof typeof TEST_GROUPS;

export const keysOf = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];
