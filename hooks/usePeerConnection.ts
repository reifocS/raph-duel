import Peer from "peerjs";
import { useEffect, useState } from "react";

const CONNECTION_STATUS = { DISCONNECTED: 0, JOINING: 1, CONNECTED: 2 };

function usePeerConnection<T>({ onReceive }: { onReceive: (c: T) => void }) {
    const [state, setState] = useState<any>({
        peer: undefined,
        id: undefined,
        connection: undefined,
        status: CONNECTION_STATUS.JOINING,
    });

    function send(msg: T) {
        state.connection.send(msg);
    }

    function connect(dest_id: string) {
        const _connection = state.peer.connect(dest_id);
        _connection.on("data", (data: any) => onReceive(data));
        initialize(_connection);
    }

    function initialize(_connection: any) {
        setState((prev: any) => ({
            ...prev,
            connection: _connection,
            status: CONNECTION_STATUS.CONNECTED,
        }));
    }

    useEffect(() => {
        const _peer = new Peer();

        setState((prev: any) => ({ ...prev, peer: _peer }));

        _peer.on("open", (_id) => setState((prev: any) => ({ ...prev, id: _id })));

        _peer.on("connection", (_connection) => {
            initialize(_connection);
            _connection.on("data", (data) => onReceive(data as T));
        });

        return () => {
            _peer.destroy();
        };
    }, [onReceive]);

    return { state, setState, connect, send };
}

export { usePeerConnection };
