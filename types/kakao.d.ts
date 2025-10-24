/**
 * Kakao Maps JavaScript API 타입 정의
 * @see https://apis.map.kakao.com/web/documentation/
 */

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

declare namespace kakao {
  namespace maps {
    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setLevel(level: number, options?: { animate?: boolean }): void;
      getLevel(): number;
      panTo(latlng: LatLng): void;
      setBounds(bounds: LatLngBounds): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClick?: boolean;
      disableDoubleClickZoom?: boolean;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latlng: LatLng): void;
      contain(latlng: LatLng): boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(position: LatLng): void;
      setImage(image: MarkerImage): void;
      setTitle(title: string): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
      title?: string;
      draggable?: boolean;
      clickable?: boolean;
      zIndex?: number;
    }

    class MarkerImage {
      constructor(
        src: string,
        size: Size,
        options?: MarkerImageOptions
      );
    }

    interface MarkerImageOptions {
      offset?: Point;
      alt?: string;
      shape?: string;
      coords?: string;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
    }

    interface InfoWindowOptions {
      content: string | HTMLElement;
      position?: LatLng;
      removable?: boolean;
      zIndex?: number;
    }

    namespace event {
      function addListener(
        target: any,
        type: string,
        handler: Function
      ): void;
      function removeListener(
        target: any,
        type: string,
        handler: Function
      ): void;
    }

    namespace services {
      class Geocoder {
        addressSearch(
          address: string,
          callback: (result: any[], status: Status) => void
        ): void;
        coord2Address(
          lng: number,
          lat: number,
          callback: (result: any[], status: Status) => void
        ): void;
      }

      enum Status {
        OK = "OK",
        ZERO_RESULT = "ZERO_RESULT",
        ERROR = "ERROR",
      }
    }

    function load(callback: () => void): void;
  }
}

export {};
