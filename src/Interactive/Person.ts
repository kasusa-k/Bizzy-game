import {
    AbstractMesh,
    Color3,
    Scene,
    SceneLoader,
    StandardMaterial,
    Vector3,
    Animation,
} from "@babylonjs/core";

type PersonProps = {
    position: Vector3;
    scene: Scene;
}

const boxSize = 2

const animation = new Animation(
    "myAnimation",
    "rotation.y",
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
);

const animationMove = new Animation(
    "animationMove",
    "position",
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
)

const delay = (delayInms: number) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
}

class Person {
    robot = new AbstractMesh("person");
    scene: Scene;
    defaultPosition: Vector3

    constructor({position, scene}: PersonProps) {
        const boxColor = new StandardMaterial("box", scene);
        boxColor.diffuseColor = new Color3(.5, .1, .4);

        this.scene = scene;

        this.defaultPosition = position

        SceneLoader.ImportMesh(null, '/models/', 'robot.glb', this.scene, (meshArray) => {
            this.robot = meshArray[0]
            this.robot.scaling = new Vector3(.3, .3, .3)
            this.robot.rotation.y = -Math.PI / 2
            this.robot.position = position
            this.robot.checkCollisions = true;
        })
    }


    resetPosition() {
        this.robot.position.set(this.defaultPosition.x, this.defaultPosition.y, this.defaultPosition.z)
    }

    async moveForward(count = 1) {
        return this.moveWithAnimation(new Vector3(0, 0, boxSize * count), -Math.PI / 2)
    }

    async moveBack(count = 1) {
        return this.moveWithAnimation(new Vector3(0, 0, -boxSize * count), Math.PI / 2)
    }

    async moveWithAnimation(newMovePosition: Vector3, newRotatePosition: number): Promise<void> {
        return new Promise((resolve) => {
            this.robot.animations = []
            animation.setKeys([{
                frame: 0,
                value: this.robot.rotation.y
            }, {
                frame: 10,
                value: newRotatePosition
            }])
            this.robot.animations.push(animation)

            animationMove.setKeys([{frame: 0, value: this.robot.position}, {
                frame: 30,
                value: this.robot.position.add(newMovePosition)
            }])

            this.robot.animations.push(animationMove)


            const distanceBetweenPositions = this.robot.position.subtract(this.robot.position.add(newMovePosition)).length()

            const normalizeSpeedBetweenPositions = distanceBetweenPositions === 2 ? 2 : distanceBetweenPositions / 2

            this.scene.beginAnimation(this.robot, 0, 30, false, normalizeSpeedBetweenPositions, async () => {
                await delay(300)
                resolve()
            })
        })
    }

    async moveLeft(count = 1) {
        return this.moveWithAnimation(new Vector3(boxSize * count, 0, 0), 0);
    }

    async moveRight(count = 1) {
        return this.moveWithAnimation(new Vector3(-boxSize * count, 0, 0), -Math.PI);
    }
}

export default Person;