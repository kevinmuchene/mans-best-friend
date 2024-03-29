export interface Dog {
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export interface LocationType {
  city: string;
  county: string;
  latitude: string;
  longitude: string;
  state: string;
}

export type FilterValues = {
  breeds: string[];
  ageMin: string;
  ageMax: string;
  validZipCodes: string[];
};

export type TypeIntialValues = {
  breeds: string[];
  zipCodes: string;
  ageMin: string;
  ageMax: string;
};
