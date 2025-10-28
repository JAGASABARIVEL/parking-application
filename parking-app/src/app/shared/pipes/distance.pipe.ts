import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'distance'
})
export class DistancePipe implements PipeTransform {
  transform(value: number): string {
    if (!value) return '0 m';
    if (value < 1) {
      return `${Math.round(value * 1000)} m`;
    }
    return `${value.toFixed(1)} km`;
  }
}