export default abstract class AbstractConnection {

	abstract connect(): void | Promise<void>;

	abstract disconnect(): void | Promise<void>;

}
