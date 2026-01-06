import { FakeSensorRunner } from "./FakeSensorRunner";

export async function startFakeSensor(): Promise<void> {
    const runner = new FakeSensorRunner();
    await runner.start();    
}