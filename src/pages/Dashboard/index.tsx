import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      try {
        const response = await api.get('/foods');
        setFoods(response.data);
      } catch {
        console.log('Get foods failed');
      }
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { name, description, price, image } = food;
      const id = foods.length + 1;
      const objFood = {
        id,
        name,
        description,
        price,
        image,
        available: true,
      };
      await api.post('/foods', objFood);

      setFoods([...foods, objFood]);
    } catch (err) {
      console.log('Add food failed');
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFoods = foods.map(pfood => {
        if (pfood.id !== editingFood.id) {
          return pfood;
        }
        return {
          ...food,
          id: editingFood.id,
          available: editingFood.available,
        };
      });
      setFoods(newFoods);
      await api.put(`/foods/${editingFood.id}`, {
        ...food,
        id: editingFood.id,
        available: editingFood.available,
      });
    } catch {
      console.log('Update food failed');
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    const selectedFood = foods.findIndex(food => food.id === id);
    foods.splice(selectedFood, 1);
    setFoods([...foods]);
    await api.delete(`/foods/${id}`);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
