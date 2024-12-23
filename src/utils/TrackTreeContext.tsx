import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { Sphere, Track, TreeNode } from "./Types";
import { updateSphere } from "./FirestoreService";
import { useAuth } from "./AuthContext";

export interface TrackTreeContextType {
  readonly rootNode: TreeNode<Track> | null;
  readonly sphere: Sphere | null;
  readonly updateNode: (nodeToUpdate: TreeNode<Track>) => void;
  readonly addChildrenToNode: (parentNode: TreeNode<Track>, newChildren: Track[]) => void;
  readonly initializeTree: (sphere: Sphere) => void;
  readonly getTrackList: () => readonly Track[];
  readonly getTracks: () => readonly Track[];
  readonly selectNode: (node: TreeNode<Track>) => void;
  readonly deselectNode: (node: TreeNode<Track>) => void;
  readonly deleteNode: (node: TreeNode<Track>) => void;
  readonly setSphere: (sphere: Sphere) => void;
  readonly findNodeById: (id: string, node: TreeNode<Track> | null) => TreeNode<Track> | undefined;
}

const TrackTreeContext = createContext<TrackTreeContextType | undefined>(undefined);

export function TrackTreeProvider({ children }: { children: React.ReactNode }) {
  const [rootNode, setRootNode] = useState<TreeNode<Track> | null>(null);
  const [sphere, setSphere] = useState<Sphere | null>(null);
  const { user } = useAuth();

  const generateId = useCallback((): string => {
    return crypto.randomUUID();
  }, []);

  const initializeTree = useCallback((data: Sphere) => {
    setRootNode(data.rootNode);
    setSphere(data);
  }, []);

  const findNodeById = useCallback(
    (id: string, node: TreeNode<Track> | null): TreeNode<Track> | undefined => {
      if (!node) return undefined;
      if (node.id === id) return node;

      const queue = [node];
      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;
        if (current.id === id) {
          return current;
        }
        queue.push(...current.children);
      }

      return undefined;
    },
    []
  );

  const updateNode = useCallback((nodeToUpdate: TreeNode<Track>) => {
    setRootNode(prevRoot => {
      if (!prevRoot) return null;

      const updateNodeRecursive = (current: TreeNode<Track>): TreeNode<Track> => {
        if (current.id === nodeToUpdate.id) {
          return nodeToUpdate;
        }
        return {
          ...current,
          children: current.children.map(updateNodeRecursive),
        };
      };

      return updateNodeRecursive(prevRoot);
    });
  }, []);

  const addChildrenToNode = useCallback((parentNode: TreeNode<Track>, newChildren: Track[]) => {
    const parent = findNodeById(parentNode.id, rootNode);
    if (!parent) return;

    const childNodes: TreeNode<Track>[] = newChildren.map(track => ({
      id: generateId(),
      value: track,
      children: [],
      parentId: parent.id,
      selected: false,
    }));

    const updatedParentNode: TreeNode<Track> = {
      ...parent,
      children: [...parent.children, ...childNodes],
    };

    updateNode(updatedParentNode);
  }, [findNodeById, generateId, rootNode, updateNode]);

  const getTrackList = useCallback((): Track[] => {
    if (!rootNode) return [];

    const tracks: Track[] = [];
    const stack = [rootNode];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current.selected) {
        tracks.push(current.value);
      }
      stack.push(...current.children);
    }

    return tracks;
  }, [rootNode]);

  const getTracks = useCallback((): Track[] => {
    if (!rootNode) return [];

    const tracks: Track[] = [];
    const stack = [rootNode];

    while (stack.length > 0) {
      const current = stack.pop()!;
      tracks.push(current.value);
      stack.push(...current.children);
    }

    return tracks;
  }, [rootNode]);

  const selectNode = useCallback((node: TreeNode<Track>) => {
    const currentNode = findNodeById(node.id, rootNode);
    if (currentNode) {
      updateNode({ ...currentNode, selected: true });
    }
  }, [findNodeById, rootNode, updateNode]);

  const deselectNode = useCallback((node: TreeNode<Track>) => {
    const currentNode = findNodeById(node.id, rootNode);
    if (currentNode) {
      updateNode({ ...currentNode, selected: false });
    }
  }, [findNodeById, rootNode, updateNode]);

  const deleteNode = useCallback((node: TreeNode<Track>) => {
    if (!rootNode) return;
    let currentNode = findNodeById(node.id, rootNode);
    if (!currentNode) return;
    if (currentNode.children && currentNode.children.length > 0) {
      currentNode = {
        ...currentNode,
        value: currentNode.children[0].value,
        children: currentNode.children.splice(1)
      }
      updateNode(currentNode);
    } else if (currentNode.parentId) {
      let parent = findNodeById(currentNode.parentId, rootNode)!;
      parent = {
        ...parent,
        children: parent.children.filter((child) => child.id !== node.id)
      };
      updateNode(parent);
    } else {
      setRootNode(null);
    }
  }, [rootNode, findNodeById, generateId, updateNode]);

  useEffect(() => {
    if (user && sphere && rootNode) {
      updateSphere(user.id, sphere, { rootNode }).catch(console.error);
    }
  }, [rootNode, sphere, user]);

  const contextValue = useMemo(() => ({
    rootNode,
    sphere,
    updateNode,
    addChildrenToNode,
    initializeTree,
    getTrackList,
    getTracks,
    selectNode,
    deselectNode,
    deleteNode,
    setSphere,
    findNodeById
  }), [
    rootNode,
    sphere,
    updateNode,
    addChildrenToNode,
    initializeTree,
    getTrackList,
    getTracks,
    selectNode,
    deselectNode,
    deleteNode,
    setSphere,
    findNodeById
  ]);

  return (
    <TrackTreeContext.Provider value={contextValue}>
      {children}
    </TrackTreeContext.Provider>
  );
}

export const useTrackTree = () => {
  const context = useContext(TrackTreeContext);
  if (!context) {
    throw new Error("useTrackTree must be used within a TrackTreeProvider");
  }
  return context;
};
