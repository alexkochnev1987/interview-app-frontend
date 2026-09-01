export function canDemoAssignInterviewToHr(actorIsDemo: boolean, hrIsDemo: boolean): boolean {
  if (!actorIsDemo) return true
  return hrIsDemo
}
