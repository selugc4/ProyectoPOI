export interface LocationToFS {
  fsq_id: string,
  name: string,
  location: {
    address: string,
    locality: string,
    region: string,
    country: string
  },
  geocodes: {
    main: {
      latitude: number,
      longitude: number
    }
  }
}
