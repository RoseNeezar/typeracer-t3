import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useGameStore } from "../store/useGame";
import { toast } from "react-hot-toast";

type InputValues = {
  nickname: string;
};

const schema = z.object({
  nickname: z.string().min(2, { message: "Please enter your nickname" }),
});

const CreateGame = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InputValues>({
    resolver: zodResolver(schema),
  });
  const { mutateAsync, isLoading } = trpc.typeracer.createGame.useMutation({
    onSuccess: (data) => {
      useGameStore.setState({
        currentPlayer: data.currentPlayer,
        Game: data.game,
      });

      if (data.game.id) router.push(`/${data.game.id}`);
    },
  });

  const onSubmit = async (data: InputValues) => {
    try {
      await mutateAsync({
        nickname: data.nickname,
      });
    } catch (error) {}

    reset();
  };

  if (errors.nickname) {
    toast.error("Enter nicknam", {
      position: "top-right",
    });
  }

  return (
    <div className="bg-gray-600 text-left">
      <div className="flex min-h-full">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="mt-8">
              <div>
                <div className="relative mt-6">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="rounded-lg bg-zinc-500 p-3 text-lg text-white">
                      Create Game
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <form
                  method="POST"
                  className="space-y-6"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div>
                    <label
                      htmlFor="nickname"
                      className="block text-sm font-medium text-white"
                    >
                      Nickname
                    </label>
                    <div className="mt-1">
                      <input
                        {...register("nickname")}
                        style={{
                          border: !errors.nickname ? "" : "2px solid red",
                        }}
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`btn-primary btn flex w-full justify-center px-4 py-2 text-sm ${
                      isLoading && "loading"
                    }`}
                  >
                    Ok
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
