import { type NextPage } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Modal } from "../components/Modal";
import CreateGame from "../view/CreateGame";
import JoinGame from "../view/JoinGame";

function CreateGameWrapper({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <CreateGame />
    </Modal>
  );
}

const CreateGameView = dynamic(() => Promise.resolve(CreateGameWrapper), {
  ssr: false,
});

function JoinGameWrapper({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <JoinGame />
    </Modal>
  );
}

const JoinGameView = dynamic(() => Promise.resolve(JoinGameWrapper), {
  ssr: false,
});

const Home: NextPage = () => {
  const [openModal, setOpenModal] = useState({
    openCreateGame: false,
    openJoinGame: false,
  });
  return (
    <>
      <div className="flex h-screen items-center justify-center bg-cyan-800">
        <div className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Typing Game</h1>
              <p className="py-6">Test you typing speed !</p>

              <div
                className="btn-primary btn mr-3"
                onClick={() =>
                  setOpenModal({ ...openModal, openCreateGame: true })
                }
              >
                Create Game
              </div>

              <div
                className="btn-secondary btn"
                onClick={() =>
                  setOpenModal({ ...openModal, openJoinGame: true })
                }
              >
                Join Game
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateGameView
        open={openModal.openCreateGame}
        onClose={() => setOpenModal({ ...openModal, openCreateGame: false })}
      />
      <JoinGameView
        open={openModal.openJoinGame}
        onClose={() => setOpenModal({ ...openModal, openJoinGame: false })}
      />
    </>
  );
};

export default Home;
