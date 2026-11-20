import { expect, it } from 'vitest';
import { dashboardClientSource } from '../src/dashboard-client.js';

it('presents physical declarations as contextual review, without claiming visual correctness', () => {
  expect(dashboardClientSource).toContain('Review physical padding');
  expect(dashboardClientSource).toContain('A visual defect is not established');
  expect(dashboardClientSource).toContain('After (Proposed Change)');
  expect(dashboardClientSource).toContain("body.append(confidenceNote)");
  expect(dashboardClientSource).toContain('not proof of an RTL defect');
  expect(dashboardClientSource).toContain('Confidence describes the static source match, not visual correctness');
  expect(dashboardClientSource).toContain('including local direction overrides');
  expect(dashboardClientSource).not.toContain('Avoid left/right in padding');
  expect(() => new Function(dashboardClientSource)).not.toThrow();
});
